const ErrorClassifier = require('./ErrorClassifier');
const ErrorFormatter = require('./ErrorFormatter');
const { BaseError } = require('./errors');

// Domain handlers
const ValidationErrorHandler = require('./domainHandlers/ValidationErrorHandler');
const ArticlesErrorHandler = require('./domainHandlers/ArticlesErrorHandler');

/**
 * Main Error Handler - Express middleware for centralized error handling
 * Orchestrates error classification, formatting, and response generation
 */
class ErrorHandler {
  constructor() {
    this.classifier = new ErrorClassifier();
    this.formatter = new ErrorFormatter();
    
    // Register domain handlers
    this.registerDomainHandlers();
  }

  /**
   * Register domain-specific error handlers
   */
  registerDomainHandlers() {
    this.classifier.registerDomainHandler('validation', new ValidationErrorHandler());
    this.classifier.registerDomainHandler('articles', new ArticlesErrorHandler());
    // Additional domain handlers will be registered as they're implemented
  }

  /**
   * Main Express middleware function
   * This is the function that gets registered with Express app.use()
   */
  handle() {
    return async (error, req, res, next) => {
      try {
        // Skip if response already sent
        if (res.headersSent) {
          return next(error);
        }

        // Classify the error
        const classifiedError = this.classifier.classify(error);

        // Apply domain-specific handling
        const processedError = await this.applyDomainHandling(classifiedError, req);

        // Generate recovery suggestions
        const recoverySuggestions = await this.generateRecoverySuggestions(processedError, req);

        // Format response for client
        const formattedResponse = this.formatter.formatResponse(
          processedError,
          recoverySuggestions,
          req
        );

        // Log the error
        this.logError(processedError, req, formattedResponse);

        // Send response
        res.status(processedError.statusCode || 500).json(formattedResponse);

      } catch (handlingError) {
        // Fallback error handling
        console.error('Error in error handler:', handlingError);
        this.sendFallbackResponse(res);
      }
    };
  }

  /**
   * Apply domain-specific error handling
   */
  async applyDomainHandling(error, req) {
    const domainHandler = this.classifier.domainHandlers.get(error.domain);
    
    if (domainHandler) {
      try {
        return await domainHandler.process(error, req);
      } catch (domainError) {
        console.error(`Domain handler error for ${error.domain}:`, domainError);
        return error; // Return original error if domain handling fails
      }
    }
    
    return error;
  }

  /**
   * Generate basic recovery suggestions
   */
  async generateRecoverySuggestions(error, req) {
    const suggestions = [];

    // Basic suggestions based on error characteristics
    if (error.isRetryable) {
      suggestions.push({
        action: 'retry_request',
        description: 'This error may be temporary. Try your request again.',
        priority: 'high'
      });
    }

    if (error.isUserError) {
      suggestions.push({
        action: 'check_input',
        description: 'Please check your input data and try again.',
        priority: 'high'
      });
    }

    if (error.category === 'external') {
      suggestions.push({
        action: 'check_external_service',
        description: 'This error is related to an external service. Please try again later.',
        priority: 'medium'
      });
    }

    // Domain-specific suggestions
    switch (error.domain) {
      case 'articles':
        if (error.errorCode === 'ROUTE_NOT_FOUND') {
          suggestions.push({
            action: 'verify_article_id',
            description: 'Verify the article ID is correct and the article exists',
            priority: 'high'
          });
        }
        break;

      case 'ai':
        if (error.errorCode === 'EXTERNAL_API_ERROR') {
          suggestions.push({
            action: 'wait_and_retry',
            description: 'AI service may be temporarily unavailable. Please try again in a few minutes.',
            priority: 'high'
          });
        }
        break;
    }

    return suggestions.slice(0, 3); // Limit to top 3 suggestions
  }

  /**
   * Log error with appropriate detail level
   */
  logError(error, req, response) {
    const logEntry = this.formatter.formatForLogging(error, req);
    
    // Use console.error for now - will be replaced with Winston logger
    console.error('Application Error:', JSON.stringify(logEntry, null, 2));
  }

  /**
   * Send fallback response when error handling fails
   */
  sendFallbackResponse(res) {
    const fallbackResponse = {
      success: false,
      error: {
        code: 'HANDLER_ERROR',
        message: 'An unexpected error occurred',
        errorId: `FALLBACK_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    };

    if (!res.headersSent) {
      res.status(500).json(fallbackResponse);
    }
  }

  /**
   * Create a 404 error for unmatched routes
   */
  static createNotFoundError(req) {
    return new BaseError(
      `Route ${req.originalUrl} not found`,
      404,
      'ROUTE_NOT_FOUND',
      { 
        path: req.originalUrl, 
        method: req.method 
      }
    );
  }
}

// Export configured middleware
const errorHandler = new ErrorHandler();

module.exports = {
  ErrorHandler,
  middleware: errorHandler.handle(),
  createNotFoundError: ErrorHandler.createNotFoundError
}; 