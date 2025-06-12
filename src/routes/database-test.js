const express = require('express');
const router = express.Router();

/**
 * Test Database Routes for Task 5.1 - Simple Mock Version
 * Tests routing without requiring actual MySQL connection
 */

/**
 * GET /api/database-test/health
 * Simple health check that doesn't require database
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Database routes are working',
    timestamp: new Date().toISOString(),
    task: 'Task 5.1: MySQL Database Integration',
    note: 'This is a test endpoint - actual MySQL connection will be tested separately'
  });
});

/**
 * GET /api/database-test/info
 * Database configuration info (without connection)
 */
router.get('/info', (req, res) => {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'storehub_auditor_dev'
  };

  res.json({
    success: true,
    message: 'Database configuration for Task 5.1',
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      // Don't expose password
      hasPassword: !!process.env.DB_PASSWORD
    },
    tables: ['audit_runs', 'audit_results', 'audit_issues', 'tickets'],
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/database-test/mock-audit-run
 * Mock audit run creation (no database)
 */
router.post('/mock-audit-run', (req, res) => {
  const { v4: uuidv4 } = require('uuid');
  
  const mockAuditRun = {
    id: uuidv4(),
    run_name: req.body.runName || 'Test Audit Run',
    description: req.body.description || 'Mock audit run for Task 5.1 testing',
    status: 'pending',
    created_at: new Date().toISOString(),
    message: 'This is a mock response - real data will be stored in MySQL'
  };

  res.status(201).json({
    success: true,
    auditRun: mockAuditRun,
    message: 'Mock audit run created successfully (Task 5.1 test)'
  });
});

module.exports = router; 