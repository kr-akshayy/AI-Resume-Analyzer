const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../middleware/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate embedding vector for a text using Gemini text-embedding-004
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    // Truncate text to avoid token limits (max ~2048 tokens)
    const truncatedText = text.substring(0, 8000);

    const result = await model.embedContent(truncatedText);
    const embedding = result.embedding.values;

    logger.debug(`Generated embedding: ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    logger.error('Failed to generate embedding', { error: error.message });
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Compute cosine similarity between two embedding vectors
 * @param {number[]} embA - First embedding
 * @param {number[]} embB - Second embedding
 * @returns {number} - Similarity score (0-100)
 */
function computeSimilarity(embA, embB) {
  if (embA.length !== embB.length) {
    throw new Error('Embedding dimensions do not match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < embA.length; i++) {
    dotProduct += embA[i] * embB[i];
    normA += embA[i] * embA[i];
    normB += embB[i] * embB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  // Cosine similarity ranges from -1 to 1, normalize to 0-100
  const cosineSim = dotProduct / (normA * normB);
  return Math.round(Math.max(0, cosineSim) * 100);
}

/**
 * Compute embedding-based similarity between resume and job description
 * @param {string} resumeText - Resume text
 * @param {string} jobDescription - Job description text
 * @returns {Promise<number>} - Similarity score (0-100)
 */
async function computeEmbeddingSimilarity(resumeText, jobDescription) {
  const [resumeEmb, jdEmb] = await Promise.all([
    generateEmbedding(resumeText),
    generateEmbedding(jobDescription)
  ]);

  const score = computeSimilarity(resumeEmb, jdEmb);
  logger.info(`Embedding similarity score: ${score}/100`);
  return score;
}

module.exports = {
  generateEmbedding,
  computeSimilarity,
  computeEmbeddingSimilarity
};
