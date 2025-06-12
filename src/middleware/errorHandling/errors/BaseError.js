const { v4: uuidv4 } = require('uuid');

/**
 * Base Error class for all custom application errors
 * Provides consistent error structure and metadata
 */
class BaseError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.errorId = this.generateErrorId();
    
    Error.captureStackTrace(this, this.constructor);
  }

  generateErrorId() {
    return `ERR_${Date.now()}_${uuidv4().substr(0, 8)}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      errorId: this.errorId,
      timestamp: this.timestamp,
      context: this.context
    };
  }

  /**
   * Check if this error should be retried
   */
  get isRetryable() {
    const retryableTypes = ['NETWORK_ERROR', 'DATABASE_ERROR', 'EXTERNAL_API_ERROR'];
    const retryableStatusCodes = [429, 502, 503, 504];
    
    return retryableTypes.includes(this.errorCode) ||
           retryableStatusCodes.includes(this.statusCode);
  }

  /**
   * Check if this is a user/client error
   */
  get isUserError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Determine error severity
   */
  get severity() {
    if (this.statusCode >= 500) return 'high';
    if (this.statusCode >= 400) return 'medium';
    return 'low';
  }
}

module.exports = BaseError; 