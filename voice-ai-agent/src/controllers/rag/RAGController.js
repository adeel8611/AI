/**
 * RAG Controller - Handles RAG-related operations
 */
export class RAGController {
  constructor(ragService) {
    this.ragService = ragService;
  }

  /**
   * Handle RAG query request
   */
  async query(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const result = await this.ragService.query(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('[RAGController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all knowledge base documents
   */
  async getKnowledgeBase(req, res) {
    try {
      const documents = await this.ragService.getKnowledgeBase();

      res.json({
        success: true,
        data: documents,
        count: documents.length,
      });
    } catch (error) {
      console.error('[RAGController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add document to knowledge base
   */
  async addDocument(req, res) {
    try {
      const { title, content, category, tags, metadata } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const document = await this.ragService.addToKnowledgeBase({
        title,
        content,
        category,
        tags,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('[RAGController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(req, res) {
    try {
      const { id } = req.params;
      const document = await this.ragService.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error('[RAGController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const deleted = await this.ragService.deleteFromKnowledgeBase(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('[RAGController] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
