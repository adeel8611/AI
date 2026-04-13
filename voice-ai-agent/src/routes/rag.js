import express from 'express';

const router = express.Router();

/**
 * Setup RAG routes
 * @param {RAGController} ragController
 */
export function setupRAGRoutes(ragController) {
  // Query the RAG system
  router.post('/query', (req, res) => ragController.query(req, res));

  // Get all knowledge base documents
  router.get('/knowledge-base', (req, res) => ragController.getKnowledgeBase(req, res));

  // Add document to knowledge base
  router.post('/knowledge-base', (req, res) => ragController.addDocument(req, res));

  // Get specific document
  router.get('/knowledge-base/:id', (req, res) => ragController.getDocument(req, res));

  // Delete document
  router.delete('/knowledge-base/:id', (req, res) => ragController.deleteDocument(req, res));

  return router;
}
