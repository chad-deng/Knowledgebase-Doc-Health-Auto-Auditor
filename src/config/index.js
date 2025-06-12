require('dotenv').config();

/**
 * Centralized configuration management
 * Loads and validates environment variables
 */
const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost'
  },

  // Logging Configuration  
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || './logs/app.log'
  },

  // External API Configuration
  apis: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      endpoint: process.env.GEMINI_API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      timeout: parseInt(process.env.GEMINI_TIMEOUT) || 30000
    }
  },

  // MySQL Database Configuration (Task 5.1)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'storehub_auditor_dev',
    ssl: process.env.DB_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10
    }
  },

  // Rules Engine Configuration
  rules: {
    outdatedThresholdMonths: parseInt(process.env.DEFAULT_OUTDATED_THRESHOLD_MONTHS) || 6,
    maxConcurrentRules: parseInt(process.env.MAX_CONCURRENT_RULES) || 5
  },

  // Security Configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindow: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Ticketing System Configuration (Task 5.4)
  ticketing: {
    jira: {
      url: process.env.JIRA_URL,
      username: process.env.JIRA_USERNAME,
      apiToken: process.env.JIRA_API_TOKEN,
      projectKey: process.env.JIRA_PROJECT_KEY || 'AUDIT'
    },
    linear: {
      apiKey: process.env.LINEAR_API_KEY,
      teamId: process.env.LINEAR_TEAM_ID
    },
    github: {
      token: process.env.GITHUB_TOKEN,
      repo: process.env.GITHUB_REPO
    }
  }
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const errors = [];

  // Check required Gemini API configuration
  if (!config.apis.gemini.apiKey) {
    errors.push('GEMINI_API_KEY is required for AI functionality');
  }

  // Validate port
  if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
    errors.push('PORT must be a valid port number between 1 and 65535');
  }

  // Validate numeric configurations
  if (isNaN(config.rules.outdatedThresholdMonths) || config.rules.outdatedThresholdMonths < 1) {
    errors.push('DEFAULT_OUTDATED_THRESHOLD_MONTHS must be a positive number');
  }

  // Validate database configuration
  if (!config.database.host) {
    errors.push('DB_HOST is required for database connectivity');
  }

  if (!config.database.user) {
    errors.push('DB_USER is required for database authentication');
  }

  if (!config.database.name) {
    errors.push('DB_NAME is required to specify target database');
  }

  if (isNaN(config.database.port) || config.database.port < 1 || config.database.port > 65535) {
    errors.push('DB_PORT must be a valid port number');
  }

  return errors;
}

/**
 * Get configuration with validation
 */
function getConfig() {
  const validationErrors = validateConfig();
  
  if (validationErrors.length > 0) {
    console.error('Configuration validation errors:');
    validationErrors.forEach(error => console.error(`  - ${error}`));
    
    if (config.server.env === 'production') {
      throw new Error('Invalid configuration in production environment');
    } else {
      console.warn('Continuing with invalid configuration in development mode');
    }
  }

  return config;
}

module.exports = getConfig(); 