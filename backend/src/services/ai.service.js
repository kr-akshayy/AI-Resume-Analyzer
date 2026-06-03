const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../middleware/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract structured data from raw resume text using Gemini AI
 * @param {string} rawText - Raw text extracted from resume
 * @returns {Promise<Object>} - Structured resume data
 */
async function extractStructuredData(rawText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert resume parser. Analyze the following resume text and extract structured information.

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, just pure JSON):
{
  "name": "Full name of the candidate",
  "email": "Email address or null",
  "phone": "Phone number or null",
  "location": "Location/City or null",
  "summary": "A brief professional summary (2-3 sentences)",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "description": "Brief description of role and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Graduation year or duration",
      "field": "Field of study"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "languages": ["language1", "language2"],
  "totalYearsExperience": 0
}

IMPORTANT:
- Extract REAL data from the resume, do not fabricate information
- If a field is not found, use null for strings or empty arrays for lists
- For skills, include both technical and soft skills mentioned
- Estimate totalYearsExperience from the experience section
- Return ONLY valid JSON, no other text

RESUME TEXT:
${rawText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Clean the response - remove any markdown formatting
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);
    logger.info('Successfully extracted structured data', { name: parsed.name });
    return parsed;
  } catch (error) {
    logger.error('Failed to extract structured data', { error: error.message });
    throw new Error(`AI extraction failed: ${error.message}`);
  }
}

/**
 * Compare resume with job description and generate detailed analysis
 * @param {Object} resumeData - Structured resume data
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} - Comparison analysis
 */
async function compareWithJobDescription(resumeData, jobDescription) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are an expert HR analyst and resume evaluator. Compare the following resume data against the job description and provide a detailed analysis.

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, just pure JSON):
{
  "overallScore": 75,
  "summary": "Brief overall assessment in 2-3 sentences",
  "skillsAnalysis": {
    "score": 80,
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "additionalSkills": ["skill5"],
    "comments": "Brief analysis of skills match"
  },
  "experienceAnalysis": {
    "score": 70,
    "relevantExperience": "Description of relevant experience",
    "yearsRequired": "As mentioned in JD or estimated",
    "yearsActual": 5,
    "comments": "Brief analysis of experience match"
  },
  "educationAnalysis": {
    "score": 85,
    "meetsRequirements": true,
    "comments": "Brief analysis of education match"
  },
  "strengths": [
    "Strength 1 with specific detail",
    "Strength 2 with specific detail"
  ],
  "improvements": [
    "Improvement area 1 with specific suggestion",
    "Improvement area 2 with specific suggestion"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ],
  "fitLevel": "Excellent|Good|Fair|Poor"
}

SCORING GUIDELINES:
- Overall score: 0-100, weighted (Skills 40%, Experience 35%, Education 25%)
- Skills score: based on matched vs required skills
- Experience score: based on years and relevance of experience
- Education score: based on degree level and field relevance
- Be fair but critical in evaluation
- Provide SPECIFIC, ACTIONABLE feedback

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DESCRIPTION:
${jobDescription}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);
    logger.info('Successfully compared resume with JD', {
      score: parsed.overallScore,
      fitLevel: parsed.fitLevel
    });
    return parsed;
  } catch (error) {
    logger.error('Failed to compare resume with JD', { error: error.message });
    throw new Error(`AI comparison failed: ${error.message}`);
  }
}

module.exports = { extractStructuredData, compareWithJobDescription };
