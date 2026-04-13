import express from 'express';
import { setupRAGRoutes } from './rag.js';

const router = express.Router();

/**
 * Setup API routes
 * @param {Object} controllers - All service controllers
 */
export function setupAPIRoutes(controllers) {
  // Health check
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // RAG routes
  router.use('/rag', setupRAGRoutes(controllers.rag));

  // STT routes
  router.post('/stt/transcribe', (req, res) => controllers.stt.transcribe(req, res));

  // TTS routes
  router.post('/tts/synthesize', (req, res) => controllers.tts.synthesize(req, res));
  router.get('/tts/voices', (req, res) => controllers.tts.getVoices(req, res));

  // LLM routes
  router.post('/llm/chat', (req, res) => controllers.llm.chat(req, res));
  router.post('/llm/system-prompt', (req, res) => controllers.llm.setSystemPrompt(req, res));

  return router;
}
