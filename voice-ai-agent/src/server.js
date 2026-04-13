import http from 'http';
import express from 'express';
import config from './config/env.js';

// Import Services
import { VectorStore } from './services/rag/VectorStore.js';
import { Retriever } from './services/rag/Retriever.js';
import { RAGService } from './services/rag/RAGService.js';
import { STTService } from './services/stt/STTService.js';
import { TTSService } from './services/tts/TTSService.js';
import { LLMService } from './services/llm/LLMService.js';

// Import Controllers
import { RAGController } from './controllers/rag/RAGController.js';
import { STTController } from './controllers/stt/STTController.js';
import { TTSController } from './controllers/tts/TTSController.js';
import { LLMController } from './controllers/llm/LLMController.js';
import { TwilioController } from './controllers/twilio/TwilioController.js';
import { WebSocketController } from './controllers/websocket/WebSocketController.js';

// Import Routes
import { setupAPIRoutes } from './routes/api.js';
import { setupTwilioRoutes } from './routes/twilio.js';

// Import WebSocket Server
import { WebSocketServer } from './services/websocket/WebSocketServer.js';

/**
 * Initialize all services
 */
function initializeServices() {
  console.log('[Server] Initializing services...');

  // RAG Services
  const vectorStore = new VectorStore();
  const retriever = new Retriever(vectorStore);
  const ragService = new RAGService(vectorStore, retriever);

  // Other Services
  const sttService = new STTService();
  const ttsService = new TTSService();
  const llmService = new LLMService();

  return {
    rag: ragService,
    stt: sttService,
    tts: ttsService,
    llm: llmService,
  };
}

/**
 * Initialize all controllers
 */
function initializeControllers(services) {
  console.log('[Server] Initializing controllers...');

  return {
    rag: new RAGController(services.rag),
    stt: new STTController(services.stt),
    tts: new TTSController(services.tts),
    llm: new LLMController(services.llm),
    twilio: new TwilioController(),
    websocket: new WebSocketController(
      services.stt,
      services.rag,
      services.llm,
      services.tts
    ),
  };
}

/**
 * Initialize Express app
 */
function createApp(controllers) {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api', setupAPIRoutes(controllers));

  // Twilio Webhook Routes
  app.use('/twilio', setupTwilioRoutes(controllers.twilio));

  // Active sessions endpoint
  app.get('/sessions', (req, res) => {
    const sessions = controllers.websocket.getAllSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('[Server] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('='.repeat(50));
    console.log('Voice AI Agent - Starting...');
    console.log('='.repeat(50));

    // Initialize services
    const services = initializeServices();
    const controllers = initializeControllers(services);

    // Create Express app
    const app = createApp(controllers);

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket server
    const wsServer = new WebSocketServer(controllers.websocket);
    wsServer.initialize(server);

    // Start listening
    const PORT = config.server.port;
    server.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
      console.log(`API endpoint: http://localhost:${PORT}/api`);
      console.log(`Twilio webhook: http://localhost:${PORT}/twilio/incoming`);
      console.log('='.repeat(50));
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Server] SIGTERM received, shutting down...');
      server.close(() => {
        console.log('[Server] Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('[Server] SIGINT received, shutting down...');
      server.close(() => {
        console.log('[Server] Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('[Server] Fatal error:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
