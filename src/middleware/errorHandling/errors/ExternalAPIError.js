const BaseError = require('./BaseError');

/**
 * External API Error class for external service failures
 * Provides API-specific error context and status code mapping
 */
class ExternalAPIError extends BaseError {
  constructor(apiName, statusCode, message, requestId = null) {
    super(
      `External API error from ${apiName}: ${message}`,
      statusCode >= 500 ? 502 : statusCode,
      'EXTERNAL_API_ERROR',
      {
        apiName,
        originalStatusCode: statusCode,
        requestId
      }
    );
  }

  /**
   * Create an error for Gemini API failures
   */
  static gemini(statusCode, message, requestId = null) {
    return new ExternalAPIError('Gemini', statusCode, message, requestId);
  }

  /**
   * Create a rate limit error
   */
  static rateLimit(apiName, retryAfter = null) {
    const error = new ExternalAPIError(
      apiName,
      429,
      'Rate limit exceeded. Please try again later.',
      null
    );
    
    if (retryAfter) {
      error.context.retryAfter = retryAfter;
    }
    
    return error;
  }

  /**
   * Create a quota exceeded error
   */
  static quotaExceeded(apiName) {
    return new ExternalAPIError(
      apiName,
      429,
      'API quota exceeded. Please try again later.',
      null
    );
  }

  /**
   * Create an authentication error
   */
  static authentication(apiName) {
    return new ExternalAPIError(
      apiName,
      401,
      'Authentication failed for external API',
      null
    );
  }

  /**
   * Create a timeout error
   */
  static timeout(apiName) {
    return new ExternalAPIError(
      apiName,
      504,
      'External API request timed out',
      null
    );
  }

  /**
   * Create a connection error
   */
  static connection(apiName) {
    return new ExternalAPIError(
      apiName,
      502,
      'Failed to connect to external API',
      null
    );
  }
}

module.exports = ExternalAPIError; 