const NodeCache = require('node-cache');
const crypto = require('crypto');

// Cache with 10-minute TTL and check period of 120 seconds
const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false
});

/**
 * Generate a cache key from resume text and job description
 */
function generateCacheKey(resumeText, jobDescription) {
  const combined = `${resumeText}::${jobDescription}`;
  return crypto.createHash('md5').update(combined).digest('hex');
}

/**
 * Get cached analysis result
 */
function getCachedAnalysis(resumeText, jobDescription) {
  const key = generateCacheKey(resumeText, jobDescription);
  return cache.get(key);
}

/**
 * Cache an analysis result
 */
function setCachedAnalysis(resumeText, jobDescription, result) {
  const key = generateCacheKey(resumeText, jobDescription);
  cache.set(key, result);
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return cache.getStats();
}

module.exports = {
  cache,
  generateCacheKey,
  getCachedAnalysis,
  setCachedAnalysis,
  getCacheStats
};
