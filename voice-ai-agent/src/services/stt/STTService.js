import { createClient } from '@deepgram/sdk';
import config from '../../config/env.js';

/**
 * Speech-to-Text Service using Deepgram
 */
export class STTService {
  constructor() {
    this.client = createClient(config.deepgram.apiKey);
  }

  /**
   * Create a live transcription connection
   * @param {Object} options - Transcription options
   * @param {Function} onTranscript - Callback for transcript results
   * @returns {WebSocket} Deepgram WebSocket connection
   */
  async createLiveConnection(options = {}, onTranscript) {
    const deepgramOptions = {
      smart_format: true,
      interim_results: true,
      punctuate: true,
      language: 'en-US',
      model: 'nova-2',
      ...options,
    };

    try {
      const connection = this.client.listen.live(deepgramOptions);

      connection.on('transcriptReceived', (data) => {
        const transcript = JSON.parse(data);

        // Only process if we have results
        if (transcript.channel) {
          const alternatives = transcript.channel.alternatives || [];
          const result = alternatives[0];

          if (result) {
            onTranscript({
              text: result.transcript,
              isFinal: transcript.is_final,
              confidence: result.confidence,
              speechFinal: transcript.speech_final,
              raw: transcript,
            });
          }
        }
      });

      connection.on('error', (error) => {
        console.error('[STTService] Deepgram error:', error);
      });

      connection.on('close', () => {
        console.log('[STTService] Deepgram connection closed');
      });

      return connection;
    } catch (error) {
      console.error('[STTService] Error creating connection:', error);
      throw error;
    }
  }

  /**
   * Send audio data to the transcription connection
   */
  sendAudio(connection, audioData) {
    if (connection && connection.getReadyState() === 1) {
      connection.send(audioData);
    }
  }

  /**
   * Close the transcription connection
   */
  closeConnection(connection) {
    if (connection) {
      connection.finish();
    }
  }

  /**
   * Pre-recorded audio transcription
   */
  async transcribeAudio(audioBuffer, options = {}) {
    try {
      const result = await this.client.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          smart_format: true,
          punctuate: true,
          language: 'en-US',
          model: 'nova-2',
          ...options,
        }
      );

      const alternatives = result?.result?.channels?.[0]?.alternatives || [];
      return alternatives[0]?.transcript || '';
    } catch (error) {
      console.error('[STTService] Transcription error:', error);
      throw error;
    }
  }
}
