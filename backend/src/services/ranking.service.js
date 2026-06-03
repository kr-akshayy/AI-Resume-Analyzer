const { logger } = require('../middleware/logger');

/**
 * Rank multiple candidates based on their analysis scores
 * @param {Array} analysisResults - Array of { resumeId, name, scores, analysis }
 * @returns {Array} - Sorted and ranked candidates
 */
function rankCandidates(analysisResults) {
  try {
    // Sort by overall score descending
    const sorted = [...analysisResults].sort((a, b) => {
      return (b.scores?.overall || 0) - (a.scores?.overall || 0);
    });

    // Assign ranks and tiers
    const ranked = sorted.map((candidate, index) => {
      const overallScore = candidate.scores?.overall || 0;

      let tier, tierColor;
      if (overallScore >= 80) {
        tier = 'Excellent';
        tierColor = '#10b981';
      } else if (overallScore >= 60) {
        tier = 'Good';
        tierColor = '#6366f1';
      } else if (overallScore >= 40) {
        tier = 'Fair';
        tierColor = '#f59e0b';
      } else {
        tier = 'Poor';
        tierColor = '#ef4444';
      }

      return {
        rank: index + 1,
        resumeId: candidate.resumeId,
        name: candidate.name || 'Unknown Candidate',
        email: candidate.email || null,
        overallScore,
        skillsScore: candidate.scores?.skills?.score || 0,
        experienceScore: candidate.scores?.experience?.score || 0,
        educationScore: candidate.scores?.education?.score || 0,
        tier,
        tierColor,
        fitLevel: candidate.scores?.fitLevel || tier,
        matchedSkills: candidate.scores?.skills?.matchedSkills || [],
        missingSkills: candidate.scores?.skills?.missingSkills || [],
        strengths: candidate.analysis?.strengths || [],
        improvements: candidate.analysis?.improvements || [],
        summary: candidate.analysis?.summary || ''
      };
    });

    logger.info(`Ranked ${ranked.length} candidates`, {
      topCandidate: ranked[0]?.name,
      topScore: ranked[0]?.overallScore
    });

    return ranked;
  } catch (error) {
    logger.error('Failed to rank candidates', { error: error.message });
    throw error;
  }
}

module.exports = { rankCandidates };
