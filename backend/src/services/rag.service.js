const { generateEmbedding } = require('./embedding.service');
const { logger } = require('../middleware/logger');

/**
 * Simple in-memory vector store for RAG functionality
 * Uses a basic array-based approach to avoid ChromaDB server dependency
 */
class VectorStore {
  constructor() {
    this.documents = []; // { id, embedding, text, metadata }
  }

  /**
   * Add a document to the vector store
   */
  async addDocument(id, text, metadata = {}) {
    try {
      const embedding = await generateEmbedding(text);
      this.documents.push({ id, embedding, text, metadata });
      logger.info(`Added document to vector store: ${id}`);
    } catch (error) {
      logger.error('Failed to add document to vector store', { error: error.message });
      throw error;
    }
  }

  /**
   * Add multiple documents (chunked)
   */
  async addDocuments(docs) {
    for (const doc of docs) {
      await this.addDocument(doc.id, doc.text, doc.metadata);
    }
  }

  /**
   * Query the vector store for most similar documents
   */
  async query(queryText, topK = 5) {
    try {
      const queryEmbedding = await generateEmbedding(queryText);

      // Compute similarity for all documents
      const results = this.documents.map(doc => ({
        id: doc.id,
        text: doc.text,
        metadata: doc.metadata,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Sort by similarity descending and take top K
      results.sort((a, b) => b.similarity - a.similarity);
      return results.slice(0, topK);
    } catch (error) {
      logger.error('Vector store query failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get the number of documents in the store
   */
  get size() {
    return this.documents.length;
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
  }
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

// Singleton instance
const resumeVectorStore = new VectorStore();

/**
 * Store a resume in the RAG vector store (chunked)
 * @param {string} resumeId - Resume ID
 * @param {string} text - Resume text
 * @param {Object} metadata - Resume metadata (name, email, etc.)
 */
async function storeResumeForRAG(resumeId, text, metadata = {}) {
  // Chunk the resume into sections for better retrieval
  const chunks = chunkText(text, 500);

  for (let i = 0; i < chunks.length; i++) {
    await resumeVectorStore.addDocument(
      `${resumeId}_chunk_${i}`,
      chunks[i],
      { ...metadata, resumeId, chunkIndex: i }
    );
  }

  logger.info(`Stored resume in RAG: ${resumeId} (${chunks.length} chunks)`);
}

/**
 * Query the RAG store for relevant resume segments
 * @param {string} query - Query text (usually job description)
 * @param {number} topK - Number of results
 * @returns {Promise<Array>} - Relevant chunks with metadata
 */
async function queryRelevantResumes(query, topK = 10) {
  const results = await resumeVectorStore.query(query, topK);

  // Group results by resumeId
  const grouped = {};
  for (const result of results) {
    const resumeId = result.metadata.resumeId;
    if (!grouped[resumeId]) {
      grouped[resumeId] = {
        resumeId,
        metadata: result.metadata,
        chunks: [],
        maxSimilarity: 0
      };
    }
    grouped[resumeId].chunks.push({
      text: result.text,
      similarity: result.similarity
    });
    grouped[resumeId].maxSimilarity = Math.max(
      grouped[resumeId].maxSimilarity,
      result.similarity
    );
  }

  // Sort by max similarity
  return Object.values(grouped).sort((a, b) => b.maxSimilarity - a.maxSimilarity);
}

/**
 * Chunk text into smaller segments
 */
function chunkText(text, maxChunkSize = 500) {
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += sentence + '. ';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

module.exports = {
  resumeVectorStore,
  storeResumeForRAG,
  queryRelevantResumes
};
