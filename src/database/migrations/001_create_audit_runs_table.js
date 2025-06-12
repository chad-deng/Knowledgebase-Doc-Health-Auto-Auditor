/**
 * Migration: Create audit_runs table
 * Stores metadata about audit executions
 */

exports.up = function(knex) {
  return knex.schema.createTable('audit_runs', (table) => {
    // Primary Key
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    
    // Basic Information
    table.string('run_name', 255).notNullable();
    table.text('description').nullable();
    table.enum('status', ['pending', 'running', 'completed', 'failed', 'cancelled']).defaultTo('pending');
    
    // Timing Information
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.integer('duration_ms').nullable(); // Duration in milliseconds
    
    // Configuration
    table.json('rules_config').nullable(); // JSON of rules configuration used
    table.json('scope_config').nullable(); // JSON of audit scope (articles, rules, etc.)
    
    // Statistics
    table.integer('total_articles_processed').defaultTo(0);
    table.integer('total_issues_found').defaultTo(0);
    table.integer('total_warnings_found').defaultTo(0);
    table.integer('total_suggestions_found').defaultTo(0);
    
    // Results Summary
    table.json('summary_stats').nullable(); // JSON summary of results
    table.text('error_message').nullable(); // Error message if status = 'failed'
    
    // Metadata
    table.string('triggered_by', 100).nullable(); // user ID or 'system'
    table.string('version', 50).nullable(); // Version of audit engine used
    table.json('environment_info').nullable(); // System environment information
    
    // Timestamps
    table.timestamps(true, true); // created_at, updated_at with defaults
    
    // Indexes
    table.index(['status']);
    table.index(['started_at']);
    table.index(['triggered_by']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('audit_runs');
};
