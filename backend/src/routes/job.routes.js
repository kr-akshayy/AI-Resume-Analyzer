const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

const router = express.Router();

/**
 * POST /api/jobs
 * Create a new job description
 */
router.post('/', authenticate, (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const db = getDatabase();
    const jobId = uuidv4();

    db.prepare('INSERT INTO jobs (id, user_id, title, description) VALUES (?, ?, ?, ?)')
      .run(jobId, req.user.id, title, description);

    logger.info('Job created', { jobId, title });

    res.status(201).json({
      message: 'Job description saved',
      job: { id: jobId, title, description }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/jobs
 * List all job descriptions for the authenticated user
 */
router.get('/', authenticate, (req, res) => {
  const db = getDatabase();
  const jobs = db.prepare(
    'SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);

  res.json({ jobs });
});

/**
 * GET /api/jobs/:id
 * Get a specific job description
 */
router.get('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const job = db.prepare(
    'SELECT * FROM jobs WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!job) {
    return res.status(404).json({ error: 'Job description not found' });
  }

  res.json({ job });
});

/**
 * DELETE /api/jobs/:id
 * Delete a job description
 */
router.delete('/:id', authenticate, (req, res) => {
  const db = getDatabase();
  const result = db.prepare(
    'DELETE FROM jobs WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Job description not found' });
  }

  res.json({ message: 'Job description deleted' });
});

module.exports = router;
