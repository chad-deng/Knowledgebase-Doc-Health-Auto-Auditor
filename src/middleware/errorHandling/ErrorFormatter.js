const errorConfig = require('./config/errorConfig.json');

/**
 * Error Formatter - Formats errors into consistent API responses
 * Handles environment-specific formatting and message sanitization
 */
class ErrorFormatter {
  constructor(config = {}) {
    this.config = {
      environment: config.environment || process.env.NODE_ENV || 'development',
      includeStack: config.includeStack,
      includeContext: config.includeContext,
      sanitizeMessages: config.sanitizeMessages
    };

    // Load environment-specific settings
    const envConfig = errorConfig.responseFormats[this.config.environment] || 
                     errorConfig.responseFormats.development;
    
    this.config = { ...this.config, ...envConfig };
  }

  /**
   * Format error into API response
   */
  formatResponse(error, recoverySuggestions = [], req = {}) {
    const baseResponse = {
      success: false,
      error: {
        code: error.errorCode || 'UNKNOWN_ERROR',
        message: this.sanitizeMessage(error.message),
        errorId: error.errorId,
        timestamp: error.timestamp || new Date().toISOString()
      }
    };

    // Add severity for client handling
    if (error.severity) {
      baseResponse.error.severity = error.severity;
    }

    // Add category for client categorization
    if (error.category) {
      baseResponse.error.category = error.category;
    }

    // Add recovery suggestions if available
    if (recoverySuggestions.length > 0) {
      baseResponse.suggestions = recoverySuggestions;
    }

    // Add validation details for validation errors
    if (error.errorCode === 'VALIDATION_ERROR' && error.context) {
      baseResponse.error.validation = {
        field: error.context.field,
        constraints: error.context.constraints
      };
    }

    // Add retry information for retryable errors
    if (error.isRetryable) {
      baseResponse.error.retryable = true;
      baseResponse.error.retryAfter = this.calculateRetryDelay(error);
    }

    // Add external API context
    if (error.errorCode === 'EXTERNAL_API_ERROR' && error.context) {
      baseResponse.error.externalApi = {
        name: error.context.apiName,
        originalStatus: error.context.originalStatusCode,
        requestId: error.context.requestId
      };
    }

    // Development-only additions
    if (this.config.includeStack && error.stack) {
      baseResponse.debug = {
        stack: error.stack,
        originalError: error.context?.originalError
      };
    }

    // Include sanitized context if enabled
    if (this.config.includeContext && error.context) {
      baseResponse.error.context = this.sanitizeContext(error.context);
    }

    return baseResponse;
  }

  /**
   * Sanitize error message to remove sensitive information
   */
  sanitizeMessage(message) {
    if (!this.config.sanitizeMessages) return message;

    // Remove potentially sensitive information
    return message
      .replace(/password=\w+/gi, 'password=***')
      .replace(/token=\w+/gi, 'token=***') 
      .replace(/key=\w+/gi, 'key=***')
      .replace(/secret=\w+/gi, 'secret=***')
      .replace(/authorization:\s*\w+/gi, 'authorization: ***')
      .replace(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, '****-****-****-****') // Credit cards
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***'); // Emails
  }

  /**
   * Sanitize error context to remove sensitive fields
   */
  sanitizeContext(context) {
    const sanitized = { ...context };
    
    // Remove sensitive fields
    const sensitiveFields = errorConfig.logging.sensitiveFields;
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    // Handle nested objects
    if (sanitized.originalError) {
      sensitiveFields.forEach(field => {
        if (sanitized.originalError[field]) {
          sanitized.originalError[field] = '***';
        }
      });
    }

    return sanitized;
  }

  /**
   * Calculate retry delay based on error type
   */
  calculateRetryDelay(error) {
    const retryDelays = errorConfig.retryDelays;
    
    // Use specific delay for error type
    if (retryDelays[error.errorCode]) {
      return retryDelays[error.errorCode];
    }

    // Use context-specific delay
    if (error.context?.retryAfter) {
      return error.context.retryAfter;
    }

    // Default delay based on category
    switch (error.category) {
      case 'external':
        return 5000;
      case 'infrastructure':
        return 3000;
      default:
        return 1000;
    }
  }

  /**
   * Format error for logging (more detailed than API response)
   */
  formatForLogging(error, req = {}) {
    const logEntry = {
      errorId: error.errorId,
      timestamp: error.timestamp,
      level: 'error',
      error: {
        name: error.name,
        message: error.message,
        code: error.errorCode,
        severity: error.severity,
        category: error.category,
        domain: error.domain,
        statusCode: error.statusCode,
        stack: error.stack
      }
    };

    // Add request context
    if (req && errorConfig.logging.includeRequest) {
      logEntry.request = {
        method: req.method,
        url: req.originalUrl,
        headers: this.sanitizeHeaders(req.headers),
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: this.sanitizeRequestBody(req.body)
      };
    }

    // Add error context
    if (error.context) {
      logEntry.error.context = this.sanitizeContext(error.context);
    }

    return logEntry;
  }

  /**
   * Sanitize request headers for logging
   */
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '***';
      }
    });

    return sanitized;
  }

  /**
   * Sanitize request body for logging
   */
  sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') return body;
    
    const sanitized = { ...body };
    const sensitiveFields = errorConfig.logging.sensitiveFields;
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}

module.exports = ErrorFormatter; 