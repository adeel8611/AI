import { Conversation } from '../../models/Conversation.js';
import { Transcript } from '../../models/Transcript.js';
import { EventEmitter } from 'events';

/**
 * WebSocket Controller - Manages real-time voice call sessions
 */
export class WebSocketController extends EventEmitter {
  constructor(sttService, ragService, llmService, ttsService) {
    super();
    this.sttService = sttService;
    this.ragService = ragService;
    this.llmService = llmService;
    this.ttsService = ttsService;

    // Active sessions: Map<callSid, Session>
    this.sessions = new Map();

    // Message queue for each session
    this.messageQueues = new Map();
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws, req) {
    const callSid = req.query.callSid || this.generateCallSid();
    const callerNumber = req.query.callerNumber || 'unknown';

    console.log(`[WebSocket] New connection: ${callSid} from ${callerNumber}`);

    // Create new session
    const session = {
      ws,
      callSid,
      callerNumber,
      conversation: new Conversation(callSid, callerNumber),
      deepgramConnection: null,
      isSpeaking: false,
      isInterrupted: false,
      audioQueue: [],
      currentTranscript: '',
    };

    this.sessions.set(callSid, session);
    this.messageQueues.set(callSid, []);

    // Setup Deepgram connection
    await this.setupDeepgramConnection(session);

    // Handle incoming messages
    ws.on('message', (data) => this.handleMessage(session, data));

    // Handle connection close
    ws.on('close', () => this.handleClose(session));

    // Handle errors
    ws.on('error', (error) => this.handleError(session, error));

    // Send ready message
    this.sendToClient(session, {
      type: 'ready',
      callSid,
      message: 'Connection established',
    });

    this.emit('connection', { callSid, callerNumber });
  }

  /**
   * Setup Deepgram live transcription
   */
  async setupDeepgramConnection(session) {
    try {
      const deepgramWs = await this.sttService.createLiveConnection(
        {
          interim_results: true,
          punctuate: true,
        },
        (transcript) => this.handleTranscript(session, transcript)
      );

      session.deepgramConnection = deepgramWs;
      console.log(`[WebSocket] Deepgram connected for ${session.callSid}`);
    } catch (error) {
      console.error(`[WebSocket] Deepgram error for ${session.callSid}:`, error);
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  async handleMessage(session, data) {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'audio':
          // Stream audio to Deepgram
          if (message.audio && session.deepgramConnection) {
            const audioBuffer = Buffer.from(message.audio, 'base64');
            this.sttService.sendAudio(session.deepgramConnection, audioBuffer);

            // Check for interruption (audio detected while AI is speaking)
            if (session.isSpeaking && this.detectSpeechActivity(message.audio)) {
              this.handleInterruption(session);
            }
          }
          break;

        case 'text':
          // Handle text message directly
          await this.processUserMessage(session, message.text);
          break;

        case 'ping':
          // Respond to ping
          this.sendToClient(session, { type: 'pong' });
          break;

        default:
          console.warn(`[WebSocket] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`[WebSocket] Message handling error:`, error);
    }
  }

  /**
   * Handle transcript from Deepgram
   */
  async handleTranscript(session, transcript) {
    // Forward transcript to client for UI/debugging
    this.sendToClient(session, {
      type: 'transcript',
      data: transcript,
    });

    if (transcript.isFinal && transcript.text.trim()) {
      session.currentTranscript = transcript.text.trim();

      // Store transcript
      const transcriptRecord = new Transcript({
        conversationId: session.conversation.id,
        text: transcript.text,
        isFinal: true,
        confidence: transcript.confidence,
        speaker: 'caller',
      });

      // Add to conversation
      session.conversation.addMessage('user', transcript.text);

      console.log(`[WebSocket] Final transcript: "${transcript.text}"`);

      // Process the message
      await this.processUserMessage(session, transcript.text);
    }
  }

  /**
   * Process user message through RAG and LLM
   */
  async processUserMessage(session, userMessage) {
    if (!userMessage.trim()) return;

    try {
      // Step 1: Query RAG for context
      const ragResult = await this.ragService.query(userMessage);

      // Step 2: Generate response with LLM
      const conversationHistory = session.conversation.getConversationHistory()
        .map(m => ({ role: m.role, content: m.content }));

      const llmResponse = await this.llmService.generateResponse(
        userMessage,
        conversationHistory,
        ragResult.context
      );

      // Add AI response to conversation
      session.conversation.addMessage('assistant', llmResponse);

      // Step 3: Convert to speech and stream back
      await this.streamResponse(session, llmResponse);

      // Send sources if available
      if (ragResult.hasContext) {
        this.sendToClient(session, {
          type: 'sources',
          data: ragResult.sources,
        });
      }

    } catch (error) {
      console.error('[WebSocket] Processing error:', error);
      this.sendToClient(session, {
        type: 'error',
        message: 'Sorry, I encountered an error processing your request.',
      });
    }
  }

  /**
   * Stream audio response to client
   */
  async streamResponse(session, text) {
    if (session.isInterrupted) {
      session.isInterrupted = false;
      return;
    }

    session.isSpeaking = true;

    try {
      // Convert text to speech
      const audioBuffer = await this.ttsService.textToSpeech(text);

      // Send audio in chunks for streaming
      const chunkSize = 4096;
      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        if (session.isInterrupted) {
          console.log(`[WebSocket] Response interrupted for ${session.callSid}`);
          break;
        }

        const chunk = audioBuffer.subarray(i, i + chunkSize);
        this.sendToClient(session, {
          type: 'audio',
          audio: chunk.toString('base64'),
          isFinal: i + chunkSize >= audioBuffer.length,
        });

        // Small delay between chunks
        await this.delay(20);
      }
    } catch (error) {
      console.error('[WebSocket] TTS error:', error);
    } finally {
      session.isSpeaking = false;
      session.isInterrupted = false;
    }
  }

  /**
   * Handle interruption
   */
  handleInterruption(session) {
    console.log(`[WebSocket] Interruption detected for ${session.callSid}`);
    session.isInterrupted = true;
    session.isSpeaking = false;
  }

  /**
   * Handle connection close
   */
  handleClose(session) {
    console.log(`[WebSocket] Connection closed: ${session.callSid}`);

    // Close Deepgram connection
    if (session.deepgramConnection) {
      this.sttService.closeConnection(session.deepgramConnection);
    }

    // Update conversation status
    session.conversation.updateStatus('ended');

    // Clean up
    this.sessions.delete(session.callSid);
    this.messageQueues.delete(session.callSid);

    this.emit('disconnection', { callSid: session.callSid });
  }

  /**
   * Handle connection error
   */
  handleError(session, error) {
    console.error(`[WebSocket] Error for ${session.callSid}:`, error);
  }

  /**
   * Send message to client
   */
  sendToClient(session, data) {
    if (session.ws.readyState === 1) { // OPEN
      session.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Get active session
   */
  getSession(callSid) {
    return this.sessions.get(callSid);
  }

  /**
   * Get all active sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values()).map(s => ({
      callSid: s.callSid,
      callerNumber: s.callerNumber,
      status: s.conversation.status,
      messageCount: s.conversation.messages.length,
    }));
  }

  /**
   * Detect speech activity in audio (simplified)
   */
  detectSpeechActivity(base64Audio) {
    // In production, use actual VAD (Voice Activity Detection)
    // For now, assume any audio data indicates speech
    return base64Audio && base64Audio.length > 100;
  }

  /**
   * Generate a call session ID
   */
  generateCallSid() {
    return `CS${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
