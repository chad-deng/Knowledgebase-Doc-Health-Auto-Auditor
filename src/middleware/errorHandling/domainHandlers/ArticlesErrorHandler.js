const { ValidationError, ServiceError } = require('../errors');

/**
 * Articles Error Handler - Domain-specific handler for articles service errors
 * Enhances article-related errors with contextual information and suggestions
 */
class ArticlesErrorHandler {
  
  /**
   * Process articles-related errors and enhance them with helpful context
   */
  async process(error, req) {
    // Handle article not found errors
    if (error instanceof ValidationError && error.context?.exists === false) {
      return this.handleArticleNotFound(error, req);
    }

    // Handle article service errors
    if (error instanceof ServiceError && error.context?.service === 'Articles') {
      return this.handleServiceError(error, req);
    }

    // Handle validation errors specific to articles
    if (error instanceof ValidationError) {
      return this.enhanceValidationError(error, req);
    }

    return error;
  }

  /**
   * Handle article not found scenarios
   */
  handleArticleNotFound(error, req) {
    const articleId = error.context?.value || req.params?.id;
    
    const enhancedError = { ...error };
    enhancedError.statusCode = 404;
    enhancedError.userMessage = `Article '${articleId}' was not found in the knowledge base.`;
    
    enhancedError.suggestions = [
      {
        action: 'verify_article_id',
        description: 'Double-check the article ID for typos',
        priority: 'high'
      },
      {
        action: 'browse_articles',
        description: 'Browse available articles at /api/articles',
        priority: 'medium'
      },
      {
        action: 'search_articles',
        description: 'Use the search functionality to find similar content',
        priority: 'medium'
      }
    ];

    // Add context-specific suggestions based on the article ID pattern
    if (articleId && articleId.includes('draft')) {
      enhancedError.suggestions.unshift({
        action: 'check_publication_status',
        description: 'This may be a draft article that is not yet published',
        priority: 'high'
      });
    }

    return enhancedError;
  }

  /**
   * Handle articles service errors
   */
  handleServiceError(error, req) {
    const operation = error.context?.operation;
    const enhancedError = { ...error };

    switch (operation) {
      case 'getArticles':
        enhancedError.userMessage = 'Failed to retrieve articles. Please try again.';
        enhancedError.suggestions = [
          {
            action: 'retry_request',
            description: 'Try the request again in a moment',
            priority: 'high'
          },
          {
            action: 'simplify_filters',
            description: 'Remove some filters and try again',
            priority: 'medium'
          }
        ];
        break;

      case 'searchArticles':
        enhancedError.userMessage = 'Search functionality is temporarily unavailable.';
        enhancedError.suggestions = [
          {
            action: 'browse_categories',
            description: 'Browse articles by category instead',
            priority: 'high'
          },
          {
            action: 'use_simple_search',
            description: 'Try a simpler search term',
            priority: 'medium'
          }
        ];
        break;

      case 'getCategories':
        enhancedError.userMessage = 'Unable to load article categories.';
        enhancedError.suggestions = [
          {
            action: 'view_all_articles',
            description: 'View all articles without category filtering',
            priority: 'high'
          }
        ];
        break;

      default:
        enhancedError.userMessage = 'An error occurred while processing your articles request.';
        enhancedError.suggestions = [
          {
            action: 'retry_request',
            description: 'Please try your request again',
            priority: 'high'
          }
        ];
    }

    return enhancedError;
  }

  /**
   * Enhance validation errors with articles-specific context
   */
  enhanceValidationError(error, req) {
    const field = error.context?.field;
    const enhancedError = { ...error };

    // Field-specific enhancements
    switch (field) {
      case 'id':
        enhancedError.suggestions = [
          {
            action: 'check_id_format',
            description: 'Article IDs should be in format: article-001, article-002, etc.',
            priority: 'high'
          },
          {
            action: 'list_articles',
            description: 'Get a list of all available article IDs from /api/articles',
            priority: 'medium'
          }
        ];
        break;

      case 'limit':
        enhancedError.suggestions = [
          {
            action: 'use_valid_limit',
            description: 'Use a limit between 1 and 100 for article listings',
            priority: 'high'
          },
          {
            action: 'use_pagination',
            description: 'Use offset parameter for pagination instead of large limits',
            priority: 'medium'
          }
        ];
        break;

      case 'sortBy':
        enhancedError.suggestions = [
          {
            action: 'use_valid_sort_field',
            description: 'Valid sort fields: title, lastModified, viewCount, helpfulVotes, category',
            priority: 'high'
          }
        ];
        break;

      case 'category':
        enhancedError.suggestions = [
          {
            action: 'check_available_categories',
            description: 'Get available categories from /api/articles/meta/categories',
            priority: 'high'
          }
        ];
        break;

      case 'query':
        if (req.path.includes('search')) {
          enhancedError.suggestions = [
            {
              action: 'use_longer_query',
              description: 'Search queries must be at least 2 characters long',
              priority: 'high'
            },
            {
              action: 'try_different_terms',
              description: 'Try different keywords or phrases',
              priority: 'medium'
            }
          ];
        }
        break;

      default:
        enhancedError.suggestions = [
          {
            action: 'check_api_documentation',
            description: 'Review the API documentation for correct parameter format',
            priority: 'medium'
          }
        ];
    }

    return enhancedError;
  }

  /**
   * Get helpful links based on the request context
   */
  getHelpfulLinks(req) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    return {
      apiDocumentation: `${baseUrl}/api`,
      allArticles: `${baseUrl}/api/articles`,
      categories: `${baseUrl}/api/articles/meta/categories`,
      tags: `${baseUrl}/api/articles/meta/tags`,
      statistics: `${baseUrl}/api/articles/meta/statistics`
    };
  }

  /**
   * Suggest similar article IDs based on pattern matching
   */
  suggestSimilarArticleIds(articleId) {
    // Extract pattern from article ID
    const patterns = [
      'article-001', 'article-002', 'article-003', 
      'article-004', 'article-005', 'article-006'
    ];

    if (!articleId) return patterns.slice(0, 3);

    // Find similar patterns
    const similar = patterns.filter(pattern => {
      const distance = this.levenshteinDistance(articleId.toLowerCase(), pattern);
      return distance <= 3;
    });

    return similar.length > 0 ? similar.slice(0, 3) : patterns.slice(0, 3);
  }

  /**
   * Calculate Levenshtein distance for similarity matching
   */
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

module.exports = ArticlesErrorHandler; 