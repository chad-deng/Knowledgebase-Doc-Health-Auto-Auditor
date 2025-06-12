#!/usr/bin/env node

/**
 * Database Setup Script for Task 5.1
 * Initializes MySQL database, creates tables, and seeds sample data
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'storehub_auditor_dev'
};

/**
 * SQL statements to create tables
 */
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
      FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE CASCADE,
      INDEX idx_audit_run_id (audit_run_id),
      INDEX idx_article_id (article_id),
      INDEX idx_result_type (result_type),
      INDEX idx_severity (severity),
      INDEX idx_rule_id (rule_id),
      INDEX idx_is_resolved (is_resolved)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
      FOREIGN KEY (audit_issue_id) REFERENCES audit_issues(id) ON DELETE SET NULL,
      INDEX idx_audit_issue_id (audit_issue_id),
      INDEX idx_external_ticket_id (external_ticket_id),
      INDEX idx_ticket_system (ticket_system),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_last_synced (last_synced)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `
};

/**
 * Sample data for development
 */
function generateSampleData() {
  const { v4: uuidv4 } = require('uuid');
  
  const auditRunId = uuidv4();
  const auditIssueId = uuidv4();
  
  return {
    auditRun: {
      id: auditRunId,
      run_name: 'Initial System Audit',
      description: 'First audit run after Task 5.1 MySQL implementation',
      status: 'completed',
      started_at: new Date(Date.now() - 300000), // 5 minutes ago
      completed_at: new Date(),
      duration_ms: 45000,
      rules_config: JSON.stringify({
        rules: ['outdated-content', 'broken-links', 'clarity-check'],
        thresholds: { outdated: 6, clarity: 0.7 }
      }),
      scope_config: JSON.stringify({
        articles: ['article-001', 'article-002', 'article-003'],
        includeArchived: false
      }),
      total_articles_processed: 3,
      total_issues_found: 2,
      total_warnings_found: 1,
      total_suggestions_found: 2,
      summary_stats: JSON.stringify({
        processingTime: '45s',
        rulesExecuted: 3,
        articlesScanned: 3,
        healthScore: 0.75
      }),
      triggered_by: 'system',
      version: '1.0.0',
      environment_info: JSON.stringify({
        nodeVersion: process.version,
        platform: process.platform,
        dbVersion: 'mysql-8.0'
      })
    },
    
    auditResults: [
      {
        id: uuidv4(),
        audit_run_id: auditRunId,
        article_id: 'article-001',
        article_title: 'Getting Started with StoreHub',
        article_url: '/docs/getting-started',
        result_type: 'issue',
        rule_id: 'outdated-content',
        rule_name: 'Outdated Content Detection',
        severity: 'high',
        message: 'Article content appears to be outdated',
        details: 'Last updated 8 months ago, contains deprecated API references',
        context_data: JSON.stringify({
          lastUpdated: '2024-03-15',
          outdatedSections: ['API Setup', 'Authentication'],
          deprecatedAPIs: ['v1/auth', 'v1/products']
        }),
        suggested_fix: JSON.stringify({
          actions: ['Update API references to v2', 'Review authentication steps'],
          priority: 'high',
          estimatedEffort: '2-3 hours'
        })
      },
      {
        id: uuidv4(),
        audit_run_id: auditRunId,
        article_id: 'article-002',
        article_title: 'API Integration Guide',
        article_url: '/docs/api-integration',
        result_type: 'warning',
        rule_id: 'clarity-check',
        rule_name: 'Content Clarity Analysis',
        severity: 'medium',
        message: 'Technical jargon may confuse business users',
        details: 'Contains technical terms without adequate explanation',
        context_data: JSON.stringify({
          jargonScore: 0.7,
          complexityLevel: 'high',
          technicalTerms: ['REST API', 'JSON payload', 'webhook']
        }),
        suggested_fix: JSON.stringify({
          actions: ['Add glossary section', 'Include more examples'],
          priority: 'medium',
          estimatedEffort: '1-2 hours'
        })
      }
    ],
    
    auditIssue: {
      id: auditIssueId,
      issue_key: 'AUDIT-001',
      title: 'Multiple articles contain outdated API references',
      description: 'Several documentation articles reference deprecated v1 API endpoints that should be updated to v2',
      severity: 'high',
      status: 'open',
      rule_id: 'outdated-content',
      occurrence_count: 2,
      affected_articles: JSON.stringify(['article-001', 'article-003']),
      first_detected: new Date(Date.now() - 86400000), // 1 day ago
      last_detected: new Date(),
      assigned_to: 'tech-writer-team',
      metadata: JSON.stringify({
        category: 'API Documentation',
        impact: 'Developer Experience',
        urgency: 'high'
      })
    },
    
    ticket: {
      id: uuidv4(),
      audit_issue_id: auditIssueId,
      external_ticket_id: 'DOC-123',
      ticket_system: 'jira',
      ticket_url: 'https://storehub.atlassian.net/browse/DOC-123',
      title: 'Update outdated API references in documentation',
      description: 'Update all v1 API references to v2 in affected documentation articles',
      status: 'open',
      priority: 'high',
      assignee: 'john.doe@storehub.com',
      created_at_external: new Date(Date.now() - 3600000), // 1 hour ago
      external_metadata: JSON.stringify({
        reporter: 'audit-system',
        labels: ['documentation', 'api', 'v2-migration'],
        components: ['Documentation']
      }),
      last_synced: new Date()
    }
  };
}

/**
 * Main setup function
 */
async function setupDatabase() {
  let connection = null;
  
  try {
    console.log('🔄 Setting up MySQL database for Task 5.1...');
    console.log(`📍 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}`);
    
    // Create connection (without database first)
    const { database, ...connectionConfig } = dbConfig;
    connection = await mysql.createConnection(connectionConfig);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`✅ Database '${database}' created/verified`);
    
    // Use the database
    await connection.execute(`USE \`${database}\``);
    
    // Create tables
    console.log('🔄 Creating database tables...');
    for (const [tableName, sql] of Object.entries(createTables)) {
      await connection.execute(sql);
      console.log(`✅ Table '${tableName}' created/verified`);
    }
    
    // Insert sample data
    console.log('🔄 Inserting sample data...');
    const sampleData = generateSampleData();
    
    // Insert audit run
    await connection.execute(
      `INSERT INTO audit_runs (id, run_name, description, status, started_at, completed_at, duration_ms, 
       rules_config, scope_config, total_articles_processed, total_issues_found, total_warnings_found, 
       total_suggestions_found, summary_stats, triggered_by, version, environment_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sampleData.auditRun.id, sampleData.auditRun.run_name, sampleData.auditRun.description,
        sampleData.auditRun.status, sampleData.auditRun.started_at, sampleData.auditRun.completed_at,
        sampleData.auditRun.duration_ms, sampleData.auditRun.rules_config, sampleData.auditRun.scope_config,
        sampleData.auditRun.total_articles_processed, sampleData.auditRun.total_issues_found,
        sampleData.auditRun.total_warnings_found, sampleData.auditRun.total_suggestions_found,
        sampleData.auditRun.summary_stats, sampleData.auditRun.triggered_by, sampleData.auditRun.version,
        sampleData.auditRun.environment_info
      ]
    );
    
    // Insert audit results
    for (const result of sampleData.auditResults) {
      await connection.execute(
        `INSERT INTO audit_results (id, audit_run_id, article_id, article_title, article_url, 
         result_type, rule_id, rule_name, severity, message, details, context_data, suggested_fix) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.id, result.audit_run_id, result.article_id, result.article_title, result.article_url,
          result.result_type, result.rule_id, result.rule_name, result.severity, result.message,
          result.details, result.context_data, result.suggested_fix
        ]
      );
    }
    
    // Insert audit issue
    await connection.execute(
      `INSERT INTO audit_issues (id, issue_key, title, description, severity, status, rule_id, 
       occurrence_count, affected_articles, first_detected, last_detected, assigned_to, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sampleData.auditIssue.id, sampleData.auditIssue.issue_key, sampleData.auditIssue.title,
        sampleData.auditIssue.description, sampleData.auditIssue.severity, sampleData.auditIssue.status,
        sampleData.auditIssue.rule_id, sampleData.auditIssue.occurrence_count, sampleData.auditIssue.affected_articles,
        sampleData.auditIssue.first_detected, sampleData.auditIssue.last_detected, sampleData.auditIssue.assigned_to,
        sampleData.auditIssue.metadata
      ]
    );
    
    // Insert ticket
    await connection.execute(
      `INSERT INTO tickets (id, audit_issue_id, external_ticket_id, ticket_system, ticket_url, 
       title, description, status, priority, assignee, created_at_external, external_metadata, last_synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sampleData.ticket.id, sampleData.ticket.audit_issue_id, sampleData.ticket.external_ticket_id,
        sampleData.ticket.ticket_system, sampleData.ticket.ticket_url, sampleData.ticket.title,
        sampleData.ticket.description, sampleData.ticket.status, sampleData.ticket.priority,
        sampleData.ticket.assignee, sampleData.ticket.created_at_external, sampleData.ticket.external_metadata,
        sampleData.ticket.last_synced
      ]
    );
    
    console.log('✅ Sample data inserted successfully');
    
    // Display statistics
    const stats = await getStatistics(connection, database);
    console.log('\n📊 Database Statistics:');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`);
    });
    
    console.log('\n🎉 Task 5.1 MySQL Database Setup Complete!');
    console.log('📍 Database ready for audit results storage');
    console.log(`🔗 Connection: mysql://${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${database}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Get table statistics
 */
async function getStatistics(connection, database) {
  const tables = ['audit_runs', 'audit_results', 'audit_issues', 'tickets'];
  const stats = {};
  
  for (const table of tables) {
    try {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
      stats[table] = rows[0].count;
    } catch (error) {
      stats[table] = 'error';
    }
  }
  
  return stats;
}

// Run the setup if this script is called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, createTables, generateSampleData }; 