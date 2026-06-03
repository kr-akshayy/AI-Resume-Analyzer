const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../middleware/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate detailed feedback, strengths, and improvement suggestions
 * @param {Object} resumeData - Structured resume data
 * @param {string} jobDescription - Job description text
 * @param {Object} scores - Section-wise scores
 * @returns {Promise<Object>} - Detailed feedback
 */
async function generateFeedback(resumeData, jobDescription, scores) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are a career coach and resume expert. Based on the resume analysis and scores, provide detailed, actionable feedback.

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, just pure JSON):
{
  "overallAssessment": "A comprehensive 3-4 sentence assessment of the candidate's fit",
  "strengths": [
    {
      "category": "Skills|Experience|Education|Other",
      "title": "Brief strength title",
      "detail": "Specific detail about why this is a strength (2-3 sentences)"
    }
  ],
  "improvements": [
    {
      "category": "Skills|Experience|Education|Resume Format|Other",
      "title": "Brief improvement title",
      "detail": "Specific detail about what to improve",
      "actionItem": "Concrete action the candidate should take"
    }
  ],
  "suggestions": [
    {
      "type": "skill_gap|experience_gap|certification|resume_tip|interview_prep",
      "title": "Suggestion title",
      "description": "Detailed suggestion (2-3 sentences)"
    }
  ],
  "resumeTips": [
    "Specific resume formatting or content tip 1",
    "Specific tip 2"
  ],
  "interviewFocus": [
    "Topic area the candidate should prepare for in interviews"
  ]
}

GUIDELINES:
- Provide at least 3 strengths and 3 improvements
- Make feedback SPECIFIC to this resume and JD, not generic
- Action items should be concrete and achievable
- Consider the scores when providing feedback

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

SCORES:
- Overall: ${scores.overall}/100
- Skills: ${scores.skills?.score}/100
- Experience: ${scores.experience?.score}/100
- Education: ${scores.education?.score}/100
- Fit Level: ${scores.fitLevel}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);
    logger.info('Feedback generated successfully', {
      strengths: parsed.strengths?.length,
      improvements: parsed.improvements?.length
    });
    return parsed;
  } catch (error) {
    logger.error('Failed to generate feedback', { error: error.message });
    throw new Error(`Feedback generation failed: ${error.message}`);
  }
}

module.exports = { generateFeedback };
