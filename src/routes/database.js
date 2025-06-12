const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

/**
 * Database Routes for Task 5.1: Audit Results Storage Setup (MySQL)
 * Provides endpoints for audit results persistence and historical data retrieval
 */

/**
 * GET /api/database/test
 * Simple test endpoint to verify routing works
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Database routes are working for Task 5.1',
    timestamp: new Date().toISOString(),
    task: 'Task 5.1: MySQL Database Integration'
  });
});

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'storehub_auditor_dev'
};

let connectionPool = null;

/**
 * Initialize database connection pool
 */
async function initializeDatabase() {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return connectionPool;
}

/**
 * GET /api/database/health
 * Database health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    await initializeDatabase();
    const [rows] = await connectionPool.execute('SELECT 1 as healthy');
    
    // Get table statistics
    const tables = ['audit_runs', 'audit_results', 'audit_issues', 'tickets'];
    const stats = {};
    
    for (const table of tables) {
      try {
        const [result] = await connectionPool.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        stats[table] = result[0].count;
      } catch (error) {
        stats[table] = 'table_not_exists';
      }
    }
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      host: dbConfig.host,
      tables: stats,
      message: 'MySQL database connection successful'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/database/setup
 * Setup database tables for Task 5.1
 */
router.post('/setup', async (req, res) => {
  try {
    await initializeDatabase();
    
    // Create tables SQL
    const createTables = {
      audit_runs: `
        CREATE TABLE IF NOT EXISTS audit_runs (
          id VARCHAR(36) PRIMARY KEY,
          run_name VARCHAR(255) NOT NULL,
          description TEXT,
          status ENUM('pending', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
          started_at TIMESTAMP NULL,
          completed_at TIMESTAMP NULL,
          duration_ms INT NULL,
          rules_config JSON,
          scope_config JSON,
          total_articles_processed INT DEFAULT 0,
          total_issues_found INT DEFAULT 0,
          total_warnings_found INT DEFAULT 0,
          total_suggestions_found INT DEFAULT 0,
          summary_stats JSON,
          error_message TEXT,
          triggered_by VARCHAR(100),
          version VARCHAR(50),
          environment_info JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_started_at (started_at),
          INDEX idx_triggered_by (triggered_by),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
      
      audit_results: `
        CREATE TABLE IF NOT EXISTS audit_results (
          id VARCHAR(36) PRIMARY KEY,
          audit_run_id VARCHAR(36) NOT NULL,
          article_id VARCHAR(100) NOT NULL,
          article_title VARCHAR(500),
          article_url VARCHAR(1000),
          result_type ENUM('issue', 'warning', 'suggestion', 'info') NOT NULL,
          rule_id VARCHAR(100) NOT NULL,
          rule_name VARCHAR(255) NOT NULL,
          severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
          message TEXT NOT NULL,
          details TEXT,
          context_data JSON,
          suggested_fix JSON,
          is_resolved BOOLEAN DEFAULT FALSE,
          resolved_at TIMESTAMP NULL,
          resolved_by VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_audit_run_id (audit_run_id),
          INDEX idx_article_id (article_id),
          INDEX idx_result_type (result_type),
          INDEX idx_severity (severity),
          INDEX idx_rule_id (rule_id),
          INDEX idx_is_resolved (is_resolved)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
      
      audit_issues: `
        CREATE TABLE IF NOT EXISTS audit_issues (
          id VARCHAR(36) PRIMARY KEY,
          issue_key VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT NOT NULL,
          severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
          status ENUM('open', 'in_progress', 'resolved', 'wont_fix') DEFAULT 'open',
          rule_id VARCHAR(100) NOT NULL,
          occurrence_count INT DEFAULT 1,
          affected_articles JSON,
          first_detected TIMESTAMP NOT NULL,
          last_detected TIMESTAMP NOT NULL,
          resolved_at TIMESTAMP NULL,
          assigned_to VARCHAR(100),
          metadata JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_issue_key (issue_key),
          INDEX idx_severity (severity),
          INDEX idx_status (status),
          INDEX idx_rule_id (rule_id),
          INDEX idx_first_detected (first_detected),
          INDEX idx_last_detected (last_detected)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `,
      
      tickets: `
        CREATE TABLE IF NOT EXISTS tickets (
          id VARCHAR(36) PRIMARY KEY,
          audit_issue_id VARCHAR(36),
          external_ticket_id VARCHAR(255) NOT NULL,
          ticket_system VARCHAR(50) NOT NULL,
          ticket_url VARCHAR(1000),
          title VARCHAR(500) NOT NULL,
          description TEXT,
          status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
          priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
          assignee VARCHAR(100),
          created_at_external TIMESTAMP NULL,
          updated_at_external TIMESTAMP NULL,
          external_metadata JSON,
          last_synced TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_audit_issue_id (audit_issue_id),
          INDEX idx_external_ticket_id (external_ticket_id),
          INDEX idx_ticket_system (ticket_system),
          INDEX idx_status (status),
          INDEX idx_priority (priority),
          INDEX idx_last_synced (last_synced)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `
    };
    
    // Create tables
    const results = {};
    for (const [tableName, sql] of Object.entries(createTables)) {
      try {
        await connectionPool.execute(sql);
        results[tableName] = 'created';
      } catch (error) {
        results[tableName] = `error: ${error.message}`;
      }
    }
    
    res.json({
      success: true,
      message: 'Database setup completed',
      tables: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/database/audit-runs
 * Create a new audit run
 */
router.post('/audit-runs', async (req, res) => {
  try {
    await initializeDatabase();
    
    const auditRun = {
      id: uuidv4(),
      run_name: req.body.runName || 'Unnamed Audit Run',
      description: req.body.description || null,
      status: 'pending',
      rules_config: JSON.stringify(req.body.rulesConfig || {}),
      scope_config: JSON.stringify(req.body.scopeConfig || {}),
      triggered_by: req.body.triggeredBy || 'api',
      version: req.body.version || '1.0.0',
      environment_info: JSON.stringify(req.body.environmentInfo || {})
    };
    
    await connectionPool.execute(
      `INSERT INTO audit_runs (id, run_name, description, status, rules_config, scope_config, 
       triggered_by, version, environment_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auditRun.id, auditRun.run_name, auditRun.description, auditRun.status,
        auditRun.rules_config, auditRun.scope_config, auditRun.triggered_by,
        auditRun.version, auditRun.environment_info
      ]
    );
    
    res.status(201).json({
      success: true,
      auditRun: auditRun,
      message: 'Audit run created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/database/audit-runs
 * Get audit run history
 */
router.get('/audit-runs', async (req, res) => {
  try {
    await initializeDatabase();
    
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const [runs] = await connectionPool.execute(
      `SELECT * FROM audit_runs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    res.json({
      success: true,
      auditRuns: runs,
      pagination: {
        limit,
        offset,
        count: runs.length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/database/statistics
 * Get database statistics and metrics
 */
router.get('/statistics', async (req, res) => {
  try {
    await initializeDatabase();
    
    // Get basic counts
    const tables = ['audit_runs', 'audit_results', 'audit_issues', 'tickets'];
    const stats = {};
    
    for (const table of tables) {
      try {
        const [result] = await connectionPool.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        stats[table] = result[0].count;
      } catch (error) {
        stats[table] = 0;
      }
    }
    
    res.json({
      success: true,
      statistics: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
