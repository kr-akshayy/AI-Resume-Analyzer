const { computeEmbeddingSimilarity } = require('./embedding.service');
const { logger } = require('../middleware/logger');

/**
 * Compute section-wise scores for a resume against a job description
 * Combines AI-based analysis with embedding similarity for robust scoring
 *
 * @param {Object} resumeData - Structured resume data
 * @param {string} jobDescription - Job description text
 * @param {Object} aiAnalysis - AI comparison analysis (from ai.service)
 * @returns {Promise<Object>} - Section-wise scores
 */
async function computeSectionScores(resumeData, jobDescription, aiAnalysis) {
  try {
    // Compute embedding-based similarity for each section
    const skillsText = (resumeData.skills || []).join(', ');
    const experienceText = (resumeData.experience || [])
      .map(e => `${e.title} at ${e.company}: ${e.description}`)
      .join('. ');
    const educationText = (resumeData.education || [])
      .map(e => `${e.degree} in ${e.field} from ${e.institution}`)
      .join('. ');

    // Parallel embedding similarity computation
    const [skillsSimilarity, experienceSimilarity, educationSimilarity] = await Promise.all([
      skillsText ? computeEmbeddingSimilarity(skillsText, jobDescription) : Promise.resolve(0),
      experienceText ? computeEmbeddingSimilarity(experienceText, jobDescription) : Promise.resolve(0),
      educationText ? computeEmbeddingSimilarity(educationText, jobDescription) : Promise.resolve(0)
    ]);

    // Blend AI analysis scores with embedding scores (60% AI, 40% embedding)
    const scores = {
      skills: {
        score: Math.round(
          (aiAnalysis.skillsAnalysis?.score || 0) * 0.6 +
          skillsSimilarity * 0.4
        ),
        embeddingScore: skillsSimilarity,
        aiScore: aiAnalysis.skillsAnalysis?.score || 0,
        matchedSkills: aiAnalysis.skillsAnalysis?.matchedSkills || [],
        missingSkills: aiAnalysis.skillsAnalysis?.missingSkills || [],
        additionalSkills: aiAnalysis.skillsAnalysis?.additionalSkills || [],
        comments: aiAnalysis.skillsAnalysis?.comments || ''
      },
      experience: {
        score: Math.round(
          (aiAnalysis.experienceAnalysis?.score || 0) * 0.6 +
          experienceSimilarity * 0.4
        ),
        embeddingScore: experienceSimilarity,
        aiScore: aiAnalysis.experienceAnalysis?.score || 0,
        relevantExperience: aiAnalysis.experienceAnalysis?.relevantExperience || '',
        yearsActual: resumeData.totalYearsExperience || 0,
        comments: aiAnalysis.experienceAnalysis?.comments || ''
      },
      education: {
        score: Math.round(
          (aiAnalysis.educationAnalysis?.score || 0) * 0.6 +
          educationSimilarity * 0.4
        ),
        embeddingScore: educationSimilarity,
        aiScore: aiAnalysis.educationAnalysis?.score || 0,
        meetsRequirements: aiAnalysis.educationAnalysis?.meetsRequirements || false,
        comments: aiAnalysis.educationAnalysis?.comments || ''
      }
    };

    // Weighted overall score: Skills 40%, Experience 35%, Education 25%
    scores.overall = Math.round(
      scores.skills.score * 0.4 +
      scores.experience.score * 0.35 +
      scores.education.score * 0.25
    );

    // Determine fit level
    if (scores.overall >= 80) scores.fitLevel = 'Excellent';
    else if (scores.overall >= 60) scores.fitLevel = 'Good';
    else if (scores.overall >= 40) scores.fitLevel = 'Fair';
    else scores.fitLevel = 'Poor';

    logger.info('Section scores computed', {
      overall: scores.overall,
      skills: scores.skills.score,
      experience: scores.experience.score,
      education: scores.education.score,
      fitLevel: scores.fitLevel
    });

    return scores;
  } catch (error) {
    logger.error('Failed to compute section scores', { error: error.message });
    throw error;
  }
}

module.exports = { computeSectionScores };
