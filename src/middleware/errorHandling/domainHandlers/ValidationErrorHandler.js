const { ValidationError } = require('../errors');

/**
 * Validation Error Handler - Domain-specific handler for validation errors
 * Enhances validation errors with user-friendly messages and field-specific guidance
 */
class ValidationErrorHandler {
  
  /**
   * Process validation errors and enhance them with helpful context
   */
  async process(error, req) {
    if (error instanceof ValidationError) {
      const enhancedError = { ...error };
      enhancedError.userMessage = this.generateUserFriendlyMessage(error);
      enhancedError.suggestions = this.generateFieldSuggestions(error);
      return enhancedError;
    }

    return error;
  }

  /**
   * Generate user-friendly error messages based on validation constraints
   */
  generateUserFriendlyMessage(error) {
    const field = error.context?.field;
    const constraints = error.context?.constraints;

    if (field && constraints) {
      if (constraints.required) {
        return `The ${field} field is required and cannot be empty.`;
      }
      
      if (constraints.minLength) {
        return `The ${field} must be at least ${constraints.minLength} characters long.`;
      }
      
      if (constraints.maxLength) {
        return `The ${field} cannot exceed ${constraints.maxLength} characters.`;
      }
      
      if (constraints.pattern) {
        return `The ${field} format is invalid. Please check the expected format.`;
      }

      if (constraints.enum) {
        return `The ${field} must be one of: ${constraints.enum.join(', ')}.`;
      }
    }

    return error.message;
  }

  /**
   * Generate field-specific suggestions for common validation errors
   */
  generateFieldSuggestions(error) {
    const field = error.context?.field;
    const suggestions = [];

    const fieldSuggestions = {
      'email': [
        { 
          action: 'check_email_format', 
          description: 'Ensure email includes @ symbol and valid domain (e.g., user@example.com)',
          priority: 'high'
        }
      ],
      'articleId': [
        { 
          action: 'verify_article_exists', 
          description: 'Check that the article ID exists in the system and is accessible',
          priority: 'high'
        }
      ],
      'ruleType': [
        { 
          action: 'check_available_rules', 
          description: 'Use one of the supported rule types: content, seo, structure, maintenance',
          priority: 'high'
        }
      ],
      'password': [
        {
          action: 'check_password_requirements',
          description: 'Ensure password meets minimum length and complexity requirements',
          priority: 'high'
        }
      ],
      'category': [
        {
          action: 'check_valid_categories',
          description: 'Use a valid article category from the available options',
          priority: 'medium'
        }
      ],
      'tags': [
        {
          action: 'format_tags_correctly',
          description: 'Ensure tags are provided as an array of strings',
          priority: 'medium'
        }
      ]
    };

    // Add field-specific suggestions
    if (fieldSuggestions[field]) {
      suggestions.push(...fieldSuggestions[field]);
    }

    // Add constraint-specific suggestions
    const constraints = error.context?.constraints;
    if (constraints) {
      if (constraints.minLength) {
        suggestions.push({
          action: 'increase_length',
          description: `Provide at least ${constraints.minLength} characters for ${field}`,
          priority: 'high'
        });
      }

      if (constraints.maxLength) {
        suggestions.push({
          action: 'reduce_length', 
          description: `Keep ${field} under ${constraints.maxLength} characters`,
          priority: 'high'
        });
      }

      if (constraints.pattern) {
        suggestions.push({
          action: 'check_format',
          description: `Ensure ${field} matches the expected format pattern`,
          priority: 'high'
        });
      }
    }

    return suggestions.slice(0, 2); // Limit to top 2 suggestions per field
  }

  /**
   * Validate common field formats
   */
  validateFieldFormat(field, value) {
    const validators = {
      email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      url: (val) => /^https?:\/\/.+/.test(val),
      articleId: (val) => /^[a-zA-Z0-9-_]+$/.test(val),
      uuid: (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)
    };

    const validator = validators[field];
    return validator ? validator(value) : true;
  }

  /**
   * Get documentation link for field validation
   */
  getDocumentationLink(field) {
    const docMap = {
      'articleId': '/docs/articles#article-id-format',
      'ruleType': '/docs/audit#rule-types',
      'category': '/docs/articles#categories',
      'tags': '/docs/articles#tagging'
    };

    return docMap[field] || '/docs/api-reference';
  }
}

module.exports = ValidationErrorHandler; 