import { v4 as uuidv4 } from 'uuid';

/**
 * Document Model - Represents RAG knowledge base documents
 */
export class Document {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.content = data.content;
    this.category = data.category || 'general';
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.embeddings = data.embeddings || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
  }

  updateContent(content) {
    this.content = content;
    this.updatedAt = new Date();
  }

  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      category: this.category,
      tags: this.tags,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
