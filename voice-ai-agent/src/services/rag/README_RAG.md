# RAG Setup Guide

## Current State
- Uses a mock VectorStore with keyword matching
- 8 pre-loaded documents in memory
- Works for testing/development

## Production Options

### Option 1: Pinecone (Recommended)
```bash
npm install @pinecone-database/pinecone
```

### Option 2: Weaviate
```bash
npm install weaviate-ts-client
```

### Option 3: Qdrant
```bash
npm install @qdrant/js-client-rest
```

### Option 4: Use Mock (Current)
- Good for testing
- Replace keyword search with actual embeddings
- Add documents via API: `POST /api/rag/knowledge-base`
