require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/db');
const { requestLogger } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const jobRoutes = require('./routes/job.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 AI Resume Analyzer API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
