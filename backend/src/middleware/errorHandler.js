const { logger } = require('./logger');

/**
 * Global error handling middleware
 * Catches all unhandled errors and returns a structured JSON response
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum file size is 10MB.'
    });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files. Maximum is 10 files per upload.'
    });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field.'
    });
  }

  // Multer filter error
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
