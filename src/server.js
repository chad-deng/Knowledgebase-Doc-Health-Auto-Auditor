const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const { middleware: errorHandler } = require('./middleware/errorHandling/ErrorHandler');

// Import routes
const articlesRoutes = require('./routes/articles');
const rulesRoutes = require('./routes/rulesRoutes');
const aiRoutes = require('./routes/aiRoutes');
const databaseRoutes = require('./routes/database'); // Task 5.1: MySQL Database Routes

/**
 * StoreHub Knowledge Base Auditor - Express.js Server
 * Provides API endpoints for knowledge base content auditing and AI-powered suggestions
 */

// Create Express application
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors());

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.env
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'StoreHub Knowledge Base Auditor API',
    version: '1.0.0',
    description: 'API for knowledge base content auditing and AI-powered suggestions',
    endpoints: {
      health: 'GET /health - Health check',
      articles: 'GET /api/articles - List articles',
      auditRules: 'GET /api/audit/rules - List audit rules',
      auditArticle: 'POST /api/audit/article/:id - Audit specific article',
      auditBatch: 'POST /api/audit/articles - Audit multiple articles',
      auditStats: 'GET /api/audit/stats - Get audit statistics',
      aiHealth: 'GET /api/ai/health - AI service health check',
      aiSuggest: 'POST /api/ai/suggest/:articleId - Generate AI suggestions',
      aiQuickFix: 'POST /api/ai/quick-fix/:articleId - Generate quick fixes',
      aiOptimize: 'POST /api/ai/optimize/:articleId - Generate optimization recommendations',
      aiBatch: 'POST /api/ai/batch-suggest - Batch AI suggestions',
      aiAnalyze: 'POST /api/ai/analyze-context/:articleId - Analyze article context',
      // Task 5.1: Database endpoints
      databaseHealth: 'GET /api/database/health - Database health check',
      databaseSetup: 'POST /api/database/setup - Setup database tables',
      auditRuns: 'GET /api/database/audit-runs - Get audit run history',
      createAuditRun: 'POST /api/database/audit-runs - Create new audit run',
      databaseStats: 'GET /api/database/statistics - Database statistics'
    },
    documentation: '/docs'
  });
});

// API Routes
app.use('/api/articles', articlesRoutes);
app.use('/api/audit', rulesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/database', databaseRoutes); // Task 5.1: MySQL Database Routes

// Global error handling middleware
app.use(errorHandler);

// Simple 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
function startServer() {
  const port = config.server.port;
  const host = config.server.host;
  
  const server = app.listen(port, host, () => {
    console.log(`🚀 StoreHub Knowledge Base Auditor server running`);
    console.log(`📍 Environment: ${config.server.env}`);
    console.log(`🌐 Server: http://${host}:${port}`);
    console.log(`🔍 Health check: http://${host}:${port}/health`);
    console.log(`📖 API info: http://${host}:${port}/api`);
    console.log(`🗄️  Database health: http://${host}:${port}/api/database/health`); // Task 5.1
    console.log('⏹️  Press Ctrl+C to stop the server');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });

  return server;
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer }; 