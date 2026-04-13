import { Document } from '../../models/Document.js';

/**
 * Mock Vector Store Service
 * In production, replace with actual vector DB (Pinecone, Weaviate, Qdrant, etc.)
 */
export class VectorStore {
  constructor() {
    this.documents = new Map();
    this.initializeMockDocuments();
  }

  /**
   * Initialize with mock documents for the knowledge base
   */
  initializeMockDocuments() {
    const mockDocs = [
      {
        title: 'Company Hours',
        content: 'Our customer service is available 24/7. Business hours are Monday to Friday, 9 AM to 6 PM EST for sales inquiries.',
        category: 'general',
        tags: ['hours', 'support', 'sales'],
      },
      {
        title: 'Return Policy',
        content: 'We offer a 30-day return policy for all unused items in original packaging. Refunds are processed within 5-7 business days.',
        category: 'policy',
        tags: ['returns', 'refund', 'policy'],
      },
      {
        title: 'Shipping Information',
        content: 'Standard shipping takes 3-5 business days. Express shipping is available for an additional fee and takes 1-2 business days.',
        category: 'shipping',
        tags: ['shipping', 'delivery'],
      },
      {
        title: 'Product Warranty',
        content: 'All our products come with a 1-year manufacturer warranty covering defects. Extended warranty options are available for purchase.',
        category: 'warranty',
        tags: ['warranty', 'guarantee'],
      },
      {
        title: 'Payment Methods',
        content: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay. Payment is processed securely at checkout.',
        category: 'payment',
        tags: ['payment', 'checkout'],
      },
      {
        title: 'Account Management',
        content: 'You can manage your account settings, order history, and preferences by logging into your account dashboard or calling our support line.',
        category: 'account',
        tags: ['account', 'profile'],
      },
      {
        title: 'Contact Information',
        content: 'For immediate assistance, call our support line at 1-800-123-4567. Email support at help@example.com. Live chat is available on our website.',
        category: 'contact',
        tags: ['contact', 'support'],
      },
      {
        title: 'Order Tracking',
        content: 'Track your order using the tracking number sent to your email. You can also check status in your account or by calling with your order number.',
        category: 'orders',
        tags: ['tracking', 'orders'],
      },
    ];

    mockDocs.forEach(doc => {
      const document = new Document(doc);
      this.documents.set(document.id, document);
    });

    console.log(`[VectorStore] Initialized with ${this.documents.size} mock documents`);
  }

  /**
   * Simulate semantic search - in production, use actual embeddings
   */
  async search(query, limit = 3) {
    const queryLower = query.toLowerCase();
    const results = [];

    // Simple keyword matching as a mock of semantic search
    for (const doc of this.documents.values()) {
      let score = 0;

      // Match in title
      if (doc.title.toLowerCase().includes(queryLower)) {
        score += 0.5;
      }

      // Match in content
      const contentLower = doc.content.toLowerCase();
      const words = queryLower.split(/\s+/);
      for (const word of words) {
        if (contentLower.includes(word)) {
          score += 0.2;
        }
      }

      // Match in tags
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 0.3;
        }
      }

      if (score > 0) {
        results.push({
          document: doc,
          score: Math.min(score, 1), // Cap at 1.0
        });
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Add a new document to the store
   */
  async addDocument(data) {
    const doc = new Document(data);
    this.documents.set(doc.id, doc);
    return doc;
  }

  /**
   * Get all documents
   */
  async getAllDocuments() {
    return Array.from(this.documents.values());
  }

  /**
   * Get document by ID
   */
  async getDocument(id) {
    return this.documents.get(id);
  }

  /**
   * Delete document
   */
  async deleteDocument(id) {
    return this.documents.delete(id);
  }
}
