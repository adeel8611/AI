/**
 * Retriever Service - Retrieves relevant context from vector store
 */
export class Retriever {
  constructor(vectorStore) {
    this.vectorStore = vectorStore;
  }

  /**
   * Retrieve relevant documents for a query
   */
  async retrieve(query, options = {}) {
    const {
      limit = 3,
      minScore = 0.1,
    } = options;

    const results = await this.vectorStore.search(query, limit);
    const filtered = results.filter(r => r.score >= minScore);

    return {
      query,
      results: filtered,
      context: filtered.map(r => r.document.content).join('\n\n'),
      hasContext: filtered.length > 0,
    };
  }

  /**
   * Format retrieved context for LLM prompt
   */
  formatContext(retrievalResult) {
    if (!retrievalResult.hasContext) {
      return null;
    }

    const sections = retrievalResult.results.map((r, i) => {
      return `[Source: ${r.document.title}]\n${r.document.content}`;
    });

    return `RELEVANT INFORMATION:\n${sections.join('\n\n---\n\n')}`;
  }
}
