require('dotenv').config();

/**
 * MySQL Database Configuration
 * Manages database connections, connection pooling, and environment-specific settings
 */

const mysql = require('mysql2/promise');
const knex = require('knex');

/**
 * Database Configuration
 */
const databaseConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'storehub_auditor_dev'
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 600000
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 5,
      max: 20,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 600000
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations'
    }
  }
};

/**
 * Get database configuration for current environment
 */
function getDatabaseConfig() {
  const env = process.env.NODE_ENV || 'development';
  return databaseConfig[env];
}

/**
 * Create Knex instance
 */
const knexInstance = knex(getDatabaseConfig());

/**
 * MySQL Connection Pool
 */
let connectionPool = null;

/**
 * Initialize MySQL connection pool
 */
async function initializeDatabase() {
  try {
    const config = getDatabaseConfig();
    
    console.log('🔄 Initializing MySQL database connection...');
    
    // Create connection pool
    connectionPool = mysql.createPool({
      ...config.connection,
      waitForConnections: true,
      connectionLimit: config.pool.max,
      queueLimit: 0,
      acquireTimeout: config.pool.acquireTimeoutMillis,
      timeout: config.pool.idleTimeoutMillis
    });

    // Test connection
    const connection = await connectionPool.getConnection();
    console.log('✅ MySQL database connection established successfully');
    
    // Release test connection
    connection.release();
    
    return connectionPool;
  } catch (error) {
    console.error('❌ Failed to initialize MySQL database:', error.message);
    throw error;
  }
}

/**
 * Get database connection from pool
 */
async function getConnection() {
  if (!connectionPool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return connectionPool.getConnection();
}

/**
 * Execute raw SQL query
 */
async function executeQuery(query, params = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
}

/**
 * Close database connections
 */
async function closeDatabase() {
  try {
    if (connectionPool) {
      await connectionPool.end();
      console.log('✅ MySQL database connections closed');
    }
    
    if (knexInstance) {
      await knexInstance.destroy();
      console.log('✅ Knex instance destroyed');
    }
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
  }
}

/**
 * Validate database configuration
 */
function validateDatabaseConfig() {
  const config = getDatabaseConfig();
  const errors = [];

  if (!config.connection.host) {
    errors.push('DB_HOST is required');
  }

  if (!config.connection.user) {
    errors.push('DB_USER is required');
  }

  if (!config.connection.database) {
    errors.push('DB_NAME is required');
  }

  return errors;
}

module.exports = {
  getDatabaseConfig,
  knex: knexInstance,
  initializeDatabase,
  getConnection,
  executeQuery,
  closeDatabase,
  validateDatabaseConfig
}; 