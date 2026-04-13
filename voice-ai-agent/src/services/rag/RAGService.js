/**
 * RAG Service - Main service combining retrieval and generation
 */
export class RAGService {
  constructor(vectorStore, retriever) {
    this.vectorStore = vectorStore;
    this.retriever = retriever;
  }

  /**
   * Query the RAG system
   */
  async query(query) {
    try {
      // Step 1: Retrieve relevant documents
      const retrievalResult = await this.retriever.retrieve(query);

      // Step 2: Format context
      const context = this.retriever.formatContext(retrievalResult);

      return {
        query,
        context,
        sources: retrievalResult.results.map(r => ({
          title: r.document.title,
          score: r.score,
          content: r.document.content,
        })),
        hasContext: retrievalResult.hasContext,
      };
    } catch (error) {
      console.error('[RAGService] Error querying:', error);
      throw error;
    }
  }

  /**
   * Get all documents in the knowledge base
   */
  async getKnowledgeBase() {
    return this.vectorStore.getAllDocuments();
  }

  /**
   * Add a new document to the knowledge base
   */
  async addToKnowledgeBase(data) {
    return this.vectorStore.addDocument(data);
  }

  /**
   * Get document by ID
   */
  async getDocument(id) {
    return this.vectorStore.getDocument(id);
  }

  /**
   * Delete document from knowledge base
   */
  async deleteFromKnowledgeBase(id) {
    return this.vectorStore.deleteDocument(id);
  }
}
