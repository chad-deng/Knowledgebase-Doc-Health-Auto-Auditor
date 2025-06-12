const { BaseError, ValidationError, ServiceError, ExternalAPIError } = require('./errors');
const errorConfig = require('./config/errorConfig.json');

/**
 * Error Classifier - Identifies and classifies errors
 * Converts generic errors into structured BaseError instances
 */
class ErrorClassifier {
  constructor(config = errorConfig) {
    this.config = config;
    this.domainHandlers = new Map();
  }

  /**
   * Register a domain-specific error handler
   */
  registerDomainHandler(domain, handler) {
    this.domainHandlers.set(domain, handler);
  }

  /**
   * Classify and enhance an error
   */
  classify(error) {
    // If already a custom error, enhance with additional metadata
    if (error instanceof BaseError) {
      return this.enhanceCustomError(error);
    }

    // Classify generic errors
    const classification = {
      type: this.determineErrorType(error),
      severity: this.determineSeverity(error),
      category: this.determineCategory(error),
      domain: this.determineDomain(error),
      isRetryable: this.isRetryable(error),
      isUserError: this.isUserError(error)
    };

    return this.createClassifiedError(error, classification);
  }

  /**
   * Enhance custom errors with additional metadata
   */
  enhanceCustomError(error) {
    const config = this.config.errorTypes[error.errorCode];
    if (config) {
      error.category = config.category;
      error.severity = config.severity;
      error.isRetryable = config.retryable;
    }
    
    error.domain = this.determineDomain(error);
    return error;
  }

  /**
   * Determine the error type from error characteristics
   */
  determineErrorType(error) {
    // MongoDB/Database errors
    if (error.name === 'MongoError' || error.code === 11000) {
      return 'DATABASE_ERROR';
    }

    // Validation errors
    if (error.name === 'ValidationError' || 
        error.message.includes('validation') ||
        error.message.includes('required') ||
        error.message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }

    // Network/Connection errors
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNRESET') {
      return 'NETWORK_ERROR';
    }

    // External API errors (based on response object)
    if (error.response && error.response.status) {
      return 'EXTERNAL_API_ERROR';
    }

    // Authentication/Authorization errors
    if (error.message.includes('unauthorized') || 
        error.message.includes('forbidden') ||
        error.message.includes('authentication') ||
        error.status === 401 || error.status === 403) {
      return 'AUTH_ERROR';
    }

    // Route not found errors
    if (error.status === 404 || error.message.includes('not found')) {
      return 'ROUTE_NOT_FOUND';
    }

    return 'SERVICE_ERROR';
  }

  /**
   * Determine error severity
   */
  determineSeverity(error) {
    if (error.statusCode >= 500 || error.status >= 500) return 'high';
    if (error.statusCode >= 400 || error.status >= 400) return 'medium';
    return 'low';
  }

  /**
   * Determine error category
   */
  determineCategory(error) {
    const type = this.determineErrorType(error);
    const categoryMap = {
      'VALIDATION_ERROR': 'client',
      'AUTH_ERROR': 'client',
      'ROUTE_NOT_FOUND': 'client',
      'DATABASE_ERROR': 'infrastructure',
      'NETWORK_ERROR': 'infrastructure',
      'EXTERNAL_API_ERROR': 'external',
      'SERVICE_ERROR': 'application'
    };
    
    return categoryMap[type] || 'application';
  }

  /**
   * Determine the domain based on stack trace or error context
   */
  determineDomain(error) {
    const stack = error.stack || '';
    
    // Check for domain-specific patterns in stack trace
    if (stack.includes('articlesService') || 
        stack.includes('/articles') ||
        stack.includes('ArticlesError')) {
      return 'articles';
    }
    
    if (stack.includes('rulesService') || 
        stack.includes('/audit') ||
        stack.includes('RulesError')) {
      return 'rules';
    }
    
    if (stack.includes('aiService') || 
        stack.includes('/ai') ||
        stack.includes('AIError') ||
        stack.includes('gemini')) {
      return 'ai';
    }
    
    if (stack.includes('validation') || 
        error.name === 'ValidationError') {
      return 'validation';
    }
    
    return 'general';
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error) {
    const type = this.determineErrorType(error);
    const retryableTypes = ['NETWORK_ERROR', 'DATABASE_ERROR', 'EXTERNAL_API_ERROR', 'SERVICE_ERROR'];
    const retryableStatusCodes = [429, 502, 503, 504];
    
    return retryableTypes.includes(type) ||
           retryableStatusCodes.includes(error.statusCode) ||
           retryableStatusCodes.includes(error.status);
  }

  /**
   * Check if error is a user/client error
   */
  isUserError(error) {
    const type = this.determineErrorType(error);
    const userErrorTypes = ['VALIDATION_ERROR', 'AUTH_ERROR', 'ROUTE_NOT_FOUND'];
    
    return userErrorTypes.includes(type) ||
           (error.statusCode >= 400 && error.statusCode < 500) ||
           (error.status >= 400 && error.status < 500);
  }

  /**
   * Create a classified error from a generic error
   */
  createClassifiedError(error, classification) {
    const config = this.config.errorTypes[classification.type];
    const statusCode = error.statusCode || error.status || (classification.isUserError ? 400 : 500);
    
    let classifiedError;
    
    switch (classification.type) {
      case 'VALIDATION_ERROR':
        classifiedError = new ValidationError(
          error.message,
          error.field || null,
          error.value || null,
          error.constraints || {}
        );
        break;
      
      case 'EXTERNAL_API_ERROR':
        const apiName = this.extractAPIName(error);
        const requestId = error.requestId || error.response?.headers?.['x-request-id'];
        classifiedError = new ExternalAPIError(
          apiName,
          statusCode,
          error.message,
          requestId
        );
        break;
      
      case 'SERVICE_ERROR':
        const service = classification.domain;
        const operation = this.extractOperation(error);
        classifiedError = new ServiceError(
          service,
          operation,
          error.message,
          error
        );
        break;
      
      default:
        classifiedError = new BaseError(
          error.message || config?.defaultMessage || 'An error occurred',
          statusCode,
          classification.type,
          {
            originalError: {
              name: error.name,
              message: error.message,
              code: error.code
            }
          }
        );
    }

    // Add classification metadata using Object.defineProperty for read-only Error properties
    try {
      Object.defineProperty(classifiedError, 'category', { value: classification.category, writable: true });
      Object.defineProperty(classifiedError, 'severity', { value: classification.severity, writable: true });
      Object.defineProperty(classifiedError, 'domain', { value: classification.domain, writable: true });
      Object.defineProperty(classifiedError, 'isRetryable', { value: classification.isRetryable, writable: true });
      Object.defineProperty(classifiedError, 'isUserError', { value: classification.isUserError, writable: true });
    } catch (propError) {
      // Fallback if property setting fails
      console.warn('Failed to set error properties:', propError.message);
    }

    return classifiedError;
  }

  /**
   * Extract API name from error context
   */
  extractAPIName(error) {
    if (error.config?.baseURL?.includes('generativelanguage.googleapis.com')) {
      return 'Gemini';
    }
    
    if (error.response?.config?.baseURL?.includes('api.openai.com')) {
      return 'OpenAI';
    }
    
    return 'Unknown API';
  }

  /**
   * Extract operation name from error context
   */
  extractOperation(error) {
    const stack = error.stack || '';
    
    // Look for common operation patterns
    if (stack.includes('getArticle')) return 'getArticle';
    if (stack.includes('createArticle')) return 'createArticle';
    if (stack.includes('updateArticle')) return 'updateArticle';
    if (stack.includes('deleteArticle')) return 'deleteArticle';
    if (stack.includes('executeRule')) return 'executeRule';
    if (stack.includes('generateSuggestion')) return 'generateSuggestion';
    
    return 'unknown';
  }
}

module.exports = ErrorClassifier; 