const { knex, initializeDatabase, closeDatabase, executeQuery } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * DatabaseService - Handles all database operations for audit results storage
 * Implements repository pattern for clean data access layer
 */
class DatabaseService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize database connection and create schema
   */
  async initialize() {
    try {
      console.log('🔄 Initializing DatabaseService...');
      
      // Initialize database connection
      await initializeDatabase();
      
      // Create database schema
      await this.createSchema();
      
      this.isInitialized = true;
      console.log('✅ DatabaseService initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize DatabaseService:', error.message);
      throw error;
    }
  }

  /**
   * Create database schema if not exists
   */
  async createSchema() {
    try {
      console.log('🔄 Creating database schema...');
      
      // Create audit_runs table
      const auditRunsExists = await knex.schema.hasTable('audit_runs');
      if (!auditRunsExists) {
        await knex.schema.createTable('audit_runs', (table) => {
          table.uuid('id').primary().defaultTo(uuidv4());
          table.string('run_name', 255).notNullable();
          table.text('description').nullable();
          table.enum('status', ['pending', 'running', 'completed', 'failed', 'cancelled']).defaultTo('pending');
          table.timestamp('started_at').nullable();
          table.timestamp('completed_at').nullable();
          table.integer('duration_ms').nullable();
          table.json('rules_config').nullable();
          table.json('scope_config').nullable();
          table.integer('total_articles_processed').defaultTo(0);
          table.integer('total_issues_found').defaultTo(0);
          table.integer('total_warnings_found').defaultTo(0);
          table.integer('total_suggestions_found').defaultTo(0);
          table.json('summary_stats').nullable();
          table.text('error_message').nullable();
          table.string('triggered_by', 100).nullable();
          table.string('version', 50).nullable();
          table.json('environment_info').nullable();
          table.timestamps(true, true);
          
          table.index(['status']);
          table.index(['started_at']);
          table.index(['triggered_by']);
          table.index(['created_at']);
        });
        console.log('✅ Created audit_runs table');
      }

      // Create audit_results table
      const auditResultsExists = await knex.schema.hasTable('audit_results');
      if (!auditResultsExists) {
        await knex.schema.createTable('audit_results', (table) => {
          table.uuid('id').primary().defaultTo(uuidv4());
          table.uuid('audit_run_id').notNullable();
          table.string('article_id', 100).notNullable();
          table.string('article_title', 500).nullable();
          table.string('article_url', 1000).nullable();
          table.enum('result_type', ['issue', 'warning', 'suggestion', 'info']).notNullable();
          table.string('rule_id', 100).notNullable();
          table.string('rule_name', 255).notNullable();
          table.enum('severity', ['critical', 'high', 'medium', 'low', 'info']).notNullable();
          table.text('message').notNullable();
          table.text('details').nullable();
          table.json('context_data').nullable();
          table.json('suggested_fix').nullable();
          table.boolean('is_resolved').defaultTo(false);
          table.timestamp('resolved_at').nullable();
          table.string('resolved_by', 100).nullable();
          table.timestamps(true, true);
          
          table.foreign('audit_run_id').references('id').inTable('audit_runs').onDelete('CASCADE');
          table.index(['audit_run_id']);
          table.index(['article_id']);
          table.index(['result_type']);
          table.index(['severity']);
          table.index(['rule_id']);
          table.index(['is_resolved']);
        });
        console.log('✅ Created audit_results table');
      }

      // Create audit_issues table (aggregated view of similar issues)
      const auditIssuesExists = await knex.schema.hasTable('audit_issues');
      if (!auditIssuesExists) {
        await knex.schema.createTable('audit_issues', (table) => {
          table.uuid('id').primary().defaultTo(uuidv4());
          table.string('issue_key', 255).unique().notNullable(); // Unique identifier for grouping
          table.string('title', 500).notNullable();
          table.text('description').notNullable();
          table.enum('severity', ['critical', 'high', 'medium', 'low', 'info']).notNullable();
          table.enum('status', ['open', 'in_progress', 'resolved', 'wont_fix']).defaultTo('open');
          table.string('rule_id', 100).notNullable();
          table.integer('occurrence_count').defaultTo(1);
          table.json('affected_articles').nullable(); // Array of article IDs
          table.timestamp('first_detected').notNullable();
          table.timestamp('last_detected').notNullable();
          table.timestamp('resolved_at').nullable();
          table.string('assigned_to', 100).nullable();
          table.json('metadata').nullable();
          table.timestamps(true, true);
          
          table.index(['issue_key']);
          table.index(['severity']);
          table.index(['status']);
          table.index(['rule_id']);
          table.index(['first_detected']);
          table.index(['last_detected']);
        });
        console.log('✅ Created audit_issues table');
      }

      // Create tickets table (external ticket system integration)
      const ticketsExists = await knex.schema.hasTable('tickets');
      if (!ticketsExists) {
        await knex.schema.createTable('tickets', (table) => {
          table.uuid('id').primary().defaultTo(uuidv4());
          table.uuid('audit_issue_id').nullable();
          table.string('external_ticket_id', 255).notNullable(); // Jira/Linear/GitHub issue ID
          table.string('ticket_system', 50).notNullable(); // 'jira', 'linear', 'github', etc.
          table.string('ticket_url', 1000).nullable();
          table.string('title', 500).notNullable();
          table.text('description').nullable();
          table.enum('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
          table.enum('priority', ['critical', 'high', 'medium', 'low']).defaultTo('medium');
          table.string('assignee', 100).nullable();
          table.timestamp('created_at_external').nullable();
          table.timestamp('updated_at_external').nullable();
          table.json('external_metadata').nullable(); // Store system-specific data
          table.timestamp('last_synced').nullable();
          table.timestamps(true, true);
          
          table.foreign('audit_issue_id').references('id').inTable('audit_issues').onDelete('SET NULL');
          table.index(['audit_issue_id']);
          table.index(['external_ticket_id']);
          table.index(['ticket_system']);
          table.index(['status']);
          table.index(['priority']);
          table.index(['last_synced']);
        });
        console.log('✅ Created tickets table');
      }

      console.log('✅ Database schema created successfully');
      
    } catch (error) {
      console.error('❌ Failed to create database schema:', error.message);
      throw error;
    }
  }

  /**
   * Create a new audit run
   */
  async createAuditRun(auditData) {
    const auditRun = {
      id: uuidv4(),
      run_name: auditData.runName,
      description: auditData.description || null,
      status: 'pending',
      started_at: null,
      rules_config: JSON.stringify(auditData.rulesConfig || {}),
      scope_config: JSON.stringify(auditData.scopeConfig || {}),
      triggered_by: auditData.triggeredBy || 'system',
      version: auditData.version || '1.0.0',
      environment_info: JSON.stringify(auditData.environmentInfo || {})
    };

    const [result] = await knex('audit_runs').insert(auditRun);
    return auditRun;
  }

  /**
   * Start an audit run
   */
  async startAuditRun(auditRunId) {
    await knex('audit_runs')
      .where('id', auditRunId)
      .update({
        status: 'running',
        started_at: knex.fn.now()
      });
  }

  /**
   * Complete an audit run
   */
  async completeAuditRun(auditRunId, results) {
    const completedAt = new Date();
    const auditRun = await knex('audit_runs').where('id', auditRunId).first();
    const duration = auditRun.started_at ? completedAt - new Date(auditRun.started_at) : null;

    await knex('audit_runs')
      .where('id', auditRunId)
      .update({
        status: 'completed',
        completed_at: completedAt,
        duration_ms: duration,
        total_articles_processed: results.totalArticles || 0,
        total_issues_found: results.totalIssues || 0,
        total_warnings_found: results.totalWarnings || 0,
        total_suggestions_found: results.totalSuggestions || 0,
        summary_stats: JSON.stringify(results.summaryStats || {})
      });
  }

  /**
   * Save audit results
   */
  async saveAuditResults(auditRunId, results) {
    const auditResults = results.map(result => ({
      id: uuidv4(),
      audit_run_id: auditRunId,
      article_id: result.articleId,
      article_title: result.articleTitle,
      article_url: result.articleUrl,
      result_type: result.type,
      rule_id: result.ruleId,
      rule_name: result.ruleName,
      severity: result.severity,
      message: result.message,
      details: result.details,
      context_data: JSON.stringify(result.contextData || {}),
      suggested_fix: JSON.stringify(result.suggestedFix || {})
    }));

    if (auditResults.length > 0) {
      await knex('audit_results').insert(auditResults);
    }
  }

  /**
   * Get audit run history
   */
  async getAuditRunHistory(limit = 50, offset = 0) {
    return await knex('audit_runs')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get audit results for a specific run
   */
  async getAuditResults(auditRunId) {
    return await knex('audit_results')
      .where('audit_run_id', auditRunId)
      .orderBy('severity', 'desc')
      .orderBy('created_at', 'asc');
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics() {
    const totalRuns = await knex('audit_runs').count('id as count').first();
    const recentRuns = await knex('audit_runs')
      .where('created_at', '>=', knex.raw('DATE_SUB(NOW(), INTERVAL 30 DAY)'))
      .count('id as count').first();
    
    const totalIssues = await knex('audit_results').count('id as count').first();
    const unresolvedIssues = await knex('audit_results')
      .where('is_resolved', false)
      .count('id as count').first();

    return {
      totalRuns: totalRuns.count,
      recentRuns: recentRuns.count,
      totalIssues: totalIssues.count,
      unresolvedIssues: unresolvedIssues.count
    };
  }

  /**
   * Seed sample data for development
   */
  async seedSampleData() {
    try {
      console.log('🔄 Seeding sample audit data...');
      
      // Create sample audit run
      const sampleAuditRun = await this.createAuditRun({
        runName: 'Sample Audit Run',
        description: 'Initial development audit run with sample data',
        rulesConfig: { rules: ['outdated-content', 'broken-links', 'clarity-check'] },
        scopeConfig: { articles: ['article-001', 'article-002', 'article-003'] },
        triggeredBy: 'system',
        version: '1.0.0',
        environmentInfo: { nodeVersion: process.version, platform: process.platform }
      });

      // Start and complete the audit run
      await this.startAuditRun(sampleAuditRun.id);
      
      // Add sample audit results
      const sampleResults = [
        {
          articleId: 'article-001',
          articleTitle: 'Getting Started with StoreHub',
          articleUrl: '/docs/getting-started',
          type: 'issue',
          ruleId: 'outdated-content',
          ruleName: 'Outdated Content Detection',
          severity: 'high',
          message: 'Article content appears to be outdated',
          details: 'Last updated 8 months ago, contains deprecated API references',
          contextData: { lastUpdated: '2024-03-15', outdatedSections: ['API Setup'] }
        },
        {
          articleId: 'article-002',
          articleTitle: 'API Integration Guide',
          articleUrl: '/docs/api-integration',
          type: 'warning',
          ruleId: 'clarity-check',
          ruleName: 'Content Clarity Analysis',
          severity: 'medium',
          message: 'Technical jargon may confuse business users',
          details: 'Contains technical terms without adequate explanation',
          contextData: { jargonScore: 0.7, complexityLevel: 'high' }
        },
        {
          articleId: 'article-003',
          articleTitle: 'Troubleshooting Common Issues',
          articleUrl: '/docs/troubleshooting',
          type: 'suggestion',
          ruleId: 'broken-links',
          ruleName: 'Link Validation',
          severity: 'low',
          message: 'Consider adding more internal links',
          details: 'Article has good external links but lacks internal cross-references',
          contextData: { internalLinks: 2, externalLinks: 8 }
        }
      ];

      await this.saveAuditResults(sampleAuditRun.id, sampleResults);
      
      // Complete the audit run
      await this.completeAuditRun(sampleAuditRun.id, {
        totalArticles: 3,
        totalIssues: 1,
        totalWarnings: 1,
        totalSuggestions: 1,
        summaryStats: {
          rulesCovered: 3,
          articlesProcessed: 3,
          processingTime: '2.5s'
        }
      });

      console.log('✅ Sample audit data seeded successfully');
      
    } catch (error) {
      console.error('❌ Failed to seed sample data:', error.message);
      throw error;
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck() {
    try {
      await knex.raw('SELECT 1');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        tablesCount: await this.getTablesCount()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get count of tables in database
   */
  async getTablesCount() {
    const tables = ['audit_runs', 'audit_results', 'audit_issues', 'tickets'];
    const counts = {};
    
    for (const table of tables) {
      try {
        const result = await knex(table).count('* as count').first();
        counts[table] = result.count;
      } catch (error) {
        counts[table] = 'error';
      }
    }
    
    return counts;
  }

  /**
   * Close database connections
   */
  async close() {
    await closeDatabase();
    this.isInitialized = false;
  }
}

module.exports = DatabaseService; 