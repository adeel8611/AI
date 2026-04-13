# Voice AI Agent Backend

A real-time voice AI agent backend using Node.js, Twilio, Deepgram, ElevenLabs, and OpenAI with RAG capabilities.

## Status

- [x] Twilio webhook for incoming calls
- [x] WebSocket audio streaming
- [x] Deepgram STT (Speech-to-Text)
- [x] ElevenLabs TTS (Text-to-Speech)
- [x] OpenAI LLM integration
- [x] RAG pipeline with mock knowledge base
- [x] MVC architecture
- [x] Interruption support
- [ ] Real vector database (Pinecone/Weaviate) - use mock for now
- [ ] Production deployment setup

## Architecture

```
voice-ai-agent/
├── src/
│   ├── config/           # Configuration files
│   │   └── env.js
│   ├── controllers/      # MVC Controllers
│   │   ├── rag/         # RAG controller
│   │   ├── llm/         # LLM controller
│   │   ├── stt/         # Speech-to-Text controller
│   │   ├── tts/         # Text-to-Speech controller
│   │   ├── twilio/      # Twilio webhook controller
│   │   └── websocket/   # WebSocket controller
│   ├── models/          # Data models
│   │   ├── Conversation.js
│   │   ├── Document.js
│   │   └── Transcript.js
│   ├── routes/          # API routes
│   │   ├── api.js
│   │   ├── rag.js
│   │   └── twilio.js
│   ├── services/        # Business logic
│   │   ├── rag/
│   │   │   ├── VectorStore.js   # Mock vector store
│   │   │   ├── Retriever.js     # Document retrieval
│   │   │   └── RAGService.js    # Main RAG service
│   │   ├── llm/         # OpenAI LLM service
│   │   ├── stt/         # Deepgram STT service
│   │   ├── tts/         # ElevenLabs TTS service
│   │   └── websocket/   # WebSocket server
│   └── server.js        # Main entry point
├── .env                 # Environment variables
├── .env.example         # Environment template
└── package.json
```

## Features

- **Incoming Call Handling**: Accept calls via Twilio webhook
- **Real-time Audio Streaming**: WebSocket-based bidirectional audio
- **Speech-to-Text**: Deepgram for live transcription
- **RAG Pipeline**: Retrieval-augmented generation with mock knowledge base
- **LLM Integration**: OpenAI GPT for response generation
- **Text-to-Speech**: ElevenLabs for natural voice output
- **Interruption Support**: Stop speaking when new audio is detected
- **MVC Architecture**: Clean separation of concerns

## Setup

### 1. Install Dependencies

```bash
cd voice-ai-agent
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Deepgram Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
```

### 3. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### RAG API
```
POST   /api/rag/query              - Query the knowledge base
GET    /api/rag/knowledge-base     - Get all documents
POST   /api/rag/knowledge-base     - Add a document
GET    /api/rag/knowledge-base/:id - Get specific document
DELETE /api/rag/knowledge-base/:id - Delete document
```

### STT API
```
POST /api/stt/transcribe - Transcribe audio (base64)
```

### TTS API
```
POST /api/tts/synthesize - Convert text to speech
GET  /api/tts/voices     - Get available voices
```

### LLM API
```
POST /api/llm/chat           - Chat with LLM
POST /api/llm/system-prompt  - Update system prompt
```

### Twilio Webhooks
```
POST /twilio/incoming - Handle incoming calls
POST /twilio/status   - Handle call status updates
```

### Active Sessions
```
GET /sessions - Get all active call sessions
```

## WebSocket Connection

Connect to: `ws://localhost:3000/ws?callSid={CALL_SID}&callerNumber={NUMBER}`

### Message Types

**Client → Server:**
```json
{
  "type": "audio",
  "audio": "base64_encoded_audio_data"
}
```

```json
{
  "type": "text",
  "text": "Your message here"
}
```

**Server → Client:**
```json
{
  "type": "ready",
  "callSid": "CS...",
  "message": "Connection established"
}
```

```json
{
  "type": "transcript",
  "data": {
    "text": "transcribed text",
    "isFinal": true,
    "confidence": 0.95
  }
}
```

```json
{
  "type": "audio",
  "audio": "base64_encoded_audio",
  "isFinal": true
}
```

## Mock RAG Knowledge Base

The system comes pre-loaded with mock documents:

- Company Hours
- Return Policy
- Shipping Information
- Product Warranty
- Payment Methods
- Account Management
- Contact Information
- Order Tracking

Add custom documents via API:

```bash
curl -X POST http://localhost:3000/api/rag/knowledge-base \
  -H "Content-Type: application/json" \
  -d '{
    "title": "FAQ Item",
    "content": "Your FAQ content here",
    "category": "faq",
    "tags": ["tag1", "tag2"]
  }'
```

## Twilio Setup

1. In your Twilio console, go to Phone Numbers
2. Configure your number's voice webhook:
   - Webhook URL: `https://your-domain.com/twilio/incoming`
   - HTTP Method: POST
3. Ensure your server is publicly accessible (use ngrok for testing):

```bash
ngrok http 3000
```

## Flow Diagram

```
Caller
   │
   ▼
Twilio (Incoming Call)
   │
   ▼
Twilio Webhook → Returns TwiML with WebSocket URL
   │
   ▼
Twilio Streams Audio → WebSocket Server
   │
   ▼
Deepgram (STT) → Transcribes Audio
   │
   ▼
RAG Service → Retrieves Context
   │
   ▼
LLM Service → Generates Response
   │
   ▼
ElevenLabs (TTS) → Converts to Audio
   │
   ▼
WebSocket Server → Streams Audio to Twilio
   │
   ▼
Caller hears response
```

## Production Considerations

1. **Vector Database**: Replace mock VectorStore with Pinecone, Weaviate, or Qdrant
2. **Embeddings**: Use actual embeddings for semantic search
3. **VAD**: Implement proper Voice Activity Detection for interruption
4. **Authentication**: Add JWT or API key authentication
5. **Rate Limiting**: Implement rate limiting for API endpoints
6. **Database**: Store conversations in PostgreSQL/MongoDB
7. **Logging**: Use Winston or Pino for structured logging
8. **Monitoring**: Add health checks and metrics
9. **Redis**: Use Redis for session management
10. **Load Balancing**: Deploy behind a load balancer with sticky sessions

## License

MIT
