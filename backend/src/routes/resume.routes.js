const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { getDatabase } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { logger } = require('../middleware/logger');
const { parseFile } = require('../services/parser.service');
const { extractStructuredData, compareWithJobDescription } = require('../services/ai.service');
const { computeEmbeddingSimilarity } = require('../services/embedding.service');
const { computeSectionScores } = require('../services/scoring.service');
const { rankCandidates } = require('../services/ranking.service');
const { generateFeedback } = require('../services/feedback.service');
const { storeResumeForRAG, queryRelevantResumes } = require('../services/rag.service');
const { getCachedAnalysis, setCachedAnalysis } = require('../config/cache');

const router = express.Router();

/**
 * POST /api/resumes/upload
 * Upload multiple resume files (PDF/DOCX)
 */
router.post('/upload', authenticate, upload.array('resumes', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded. Please upload PDF or DOCX files.' });
    }

    const db = getDatabase();
    const uploadedResumes = [];

    for (const file of req.files) {
      try {
        // Parse file to extract text
        const rawText = await parseFile(file.path, file.originalname);

        // Extract structured data using AI
        const parsedData = await extractStructuredData(rawText);

        // Save to database
        const resumeId = uuidv4();
        db.prepare(
          'INSERT INTO resumes (id, user_id, filename, original_name, raw_text, parsed_data) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(resumeId, req.user.id, file.filename, file.originalname, rawText, JSON.stringify(parsedData));

        // Store in RAG vector store
        try {
          await storeResumeForRAG(resumeId, rawText, {
            name: parsedData.name,
            email: parsedData.email,
            skills: parsedData.skills
          });
        } catch (ragError) {
          logger.warn('RAG storage failed (non-critical)', { error: ragError.message });
        }

        uploadedResumes.push({
          id: resumeId,
          originalName: file.originalname,
          parsedData
        });

        logger.info('Resume uploaded and parsed', { resumeId, name: parsedData.name });
      } catch (parseError) {
        logger.error('Failed to process resume', {
          file: file.originalname,
          error: parseError.message
        });
        uploadedResumes.push({
          originalName: file.originalname,
          error: parseError.message
        });
      }
    }

    res.status(201).json({
      message: `Processed ${uploadedResumes.length} resume(s)`,
      resumes: uploadedResumes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/resumes/analyze
 * Analyze resumes against a job description
 */
router.post('/analyze', authenticate, async (req, res, next) => {
  try {
    const { resumeIds, jobDescription, jobId } = req.body;

    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
      return res.status(400).json({ error: 'resumeIds array is required' });
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ error: 'jobDescription is required' });
    }

    const db = getDatabase();
    const analysisResults = [];

    for (const resumeId of resumeIds) {
      const resume = db.prepare(
        'SELECT * FROM resumes WHERE id = ? AND user_id = ?'
      ).get(resumeId, req.user.id);

      if (!resume) {
        analysisResults.push({
          resumeId,
          error: 'Resume not found'
        });
        continue;
      }

      const parsedData = JSON.parse(resume.parsed_data);
      const rawText = resume.raw_text;

      // Check cache
      const cached = getCachedAnalysis(rawText, jobDescription);
      if (cached) {
        logger.info('Using cached analysis', { resumeId });
        analysisResults.push({ resumeId, ...cached });
        continue;
      }

      try {
        // Step 1: AI comparison
        const aiAnalysis = await compareWithJobDescription(parsedData, jobDescription);

        // Step 2: Embedding similarity
        const embeddingSimilarity = await computeEmbeddingSimilarity(rawText, jobDescription);

        // Step 3: Section-wise scoring
        const scores = await computeSectionScores(parsedData, jobDescription, aiAnalysis);

        // Step 4: Generate feedback
        const feedback = await generateFeedback(parsedData, jobDescription, scores);

        const result = {
          resumeId,
          name: parsedData.name,
          email: parsedData.email,
          parsedData,
          embeddingSimilarity,
          scores,
          analysis: aiAnalysis,
          feedback
        };

        // Cache the result
        setCachedAnalysis(rawText, jobDescription, result);

        analysisResults.push(result);

        logger.info('Resume analyzed', {
          resumeId,
          name: parsedData.name,
          overallScore: scores.overall
        });
      } catch (analysisError) {
        logger.error('Analysis failed for resume', {
          resumeId,
          error: analysisError.message
        });
        analysisResults.push({
          resumeId,
          name: parsedData.name,
          error: analysisError.message
        });
      }
    }

    // Step 5: Rank candidates
    const validResults = analysisResults.filter(r => !r.error);
    const rankings = rankCandidates(validResults);

    // Save analysis to database
    if (jobId) {
      const analysisId = uuidv4();
      db.prepare(
        'INSERT INTO analyses (id, user_id, job_id, results) VALUES (?, ?, ?, ?)'
      ).run(analysisId, req.user.id, jobId, JSON.stringify({ rankings, results: analysisResults }));
    }

    res.json({
      message: `Analyzed ${validResults.length} resume(s)`,
      rankings,
      results: analysisResults,
      totalProcessed: resumeIds.length,
      successCount: validResults.length,
      errorCount: analysisResults.filter(r => r.error).length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resumes
 * List all resumes for the authenticated user
 */
router.get('/', authenticate, (req, res) => {
  const db = getDatabase();
  const resumes = db.prepare(
    'SELECT id, original_name, parsed_data, created_at FROM resumes WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);

  const formatted = resumes.map(r => ({
    id: r.id,
    originalName: r.original_name,
    parsedData: JSON.parse(r.parsed_data),
    createdAt: r.created_at
  }));

  res.json({ resumes: formatted });
});

/**
 * GET /api/resumes/:id
 * Get a specific resume
 */
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const resume = db.prepare(
    'SELECT * FROM resumes WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  res.json({
    id: resume.id,
    originalName: resume.original_name,
    rawText: resume.raw_text,
    parsedData: JSON.parse(resume.parsed_data),
    createdAt: resume.created_at
  });
});

/**
 * POST /api/resumes/rag-search
 * Search for relevant resumes using RAG
 */
router.post('/rag-search', authenticate, async (req, res, next) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const results = await queryRelevantResumes(query, topK);

    res.json({
      message: `Found ${results.length} relevant resume(s)`,
      results: results.map(r => ({
        resumeId: r.resumeId,
        metadata: r.metadata,
        similarity: Math.round(r.maxSimilarity * 100),
        relevantChunks: r.chunks.length
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
