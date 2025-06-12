const BaseError = require('./BaseError');

/**
 * Service Error class for internal service failures
 * Provides service and operation context
 */
class ServiceError extends BaseError {
  constructor(service, operation, message, originalError = null) {
    super(
      `${service} service error during ${operation}: ${message}`,
      500,
      'SERVICE_ERROR',
      {
        service,
        operation,
        originalError: originalError ? {
          message: originalError.message,
          name: originalError.name,
          code: originalError.code
        } : null
      }
    );
  }

  /**
   * Create a service error for articles service
   */
  static articles(operation, message, originalError = null) {
    return new ServiceError('Articles', operation, message, originalError);
  }

  /**
   * Create a service error for rules service
   */
  static rules(operation, message, originalError = null) {
    return new ServiceError('Rules', operation, message, originalError);
  }

  /**
   * Create a service error for AI service
   */
  static ai(operation, message, originalError = null) {
    return new ServiceError('AI', operation, message, originalError);
  }

  /**
   * Create a service error for data operations
   */
  static data(operation, message, originalError = null) {
    return new ServiceError('Data', operation, message, originalError);
  }
}

module.exports = ServiceError; 