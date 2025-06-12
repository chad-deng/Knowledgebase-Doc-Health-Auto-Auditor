const express = require('express');
const ArticlesService = require('../services/articlesService');
const { ValidationError } = require('../middleware/errorHandling/errors');

const router = express.Router();
const articlesService = new ArticlesService();

/**
 * Articles Routes - RESTful API for knowledge base articles
 * Provides endpoints for retrieving, searching, and managing articles
 */

/**
 * GET /api/articles
 * List articles with optional filtering, searching, and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      status = 'published',
      tags,
      search,
      limit = '20',
      offset = '0',
      sortBy = 'lastModified',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination parameters
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw ValidationError.invalidFormat('limit', limit, 'Must be a number between 1 and 100');
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      throw ValidationError.invalidFormat('offset', offset, 'Must be a non-negative number');
    }

    // Validate sort parameters
    const validSortFields = ['title', 'lastModified', 'viewCount', 'helpfulVotes', 'category'];
    if (!validSortFields.includes(sortBy)) {
      throw ValidationError.invalidEnum('sortBy', sortBy, validSortFields);
    }

    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder)) {
      throw ValidationError.invalidEnum('sortOrder', sortOrder, validSortOrders);
    }

    const options = {
      category,
      status,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : undefined,
      search,
      limit: limitNum,
      offset: offsetNum,
      sortBy,
      sortOrder
    };

    const result = await articlesService.getArticles(options);

    res.json({
      success: true,
      data: {
        articles: result.articles,
        pagination: result.pagination
      },
      meta: {
        totalResults: result.pagination.total,
        requestedAt: new Date().toISOString(),
        filters: {
          category,
          status,
          tags,
          search
        },
        sorting: {
          sortBy,
          sortOrder
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/categories
 * Get all article categories with article counts
 */
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await articlesService.getCategories();

    res.json({
      success: true,
      data: {
        categories
      },
      meta: {
        totalCategories: categories.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/tags
 * Get all article tags with usage counts
 */
router.get('/meta/tags', async (req, res, next) => {
  try {
    const tags = await articlesService.getTags();

    res.json({
      success: true,
      data: {
        tags
      },
      meta: {
        totalTags: tags.length,
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/search
 * Search articles with advanced options
 */
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const {
      category,
      tags,
      limit = '10',
      offset = '0',
      sortBy = 'relevance'
    } = req.query;

    if (!query || query.trim().length < 2) {
      throw ValidationError.invalidLength('query', query, 2);
    }

    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      throw ValidationError.invalidFormat('limit', limit, 'Must be a number between 1 and 50');
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      throw ValidationError.invalidFormat('offset', offset, 'Must be a non-negative number');
    }

    const options = {
      category,
      tags: tags ? tags.split(',') : undefined,
      limit: limitNum,
      offset: offsetNum,
      sortBy: sortBy === 'relevance' ? 'viewCount' : sortBy,
      sortOrder: 'desc'
    };

    const result = await articlesService.searchArticles(query, options);

    res.json({
      success: true,
      data: {
        articles: result.articles,
        pagination: result.pagination
      },
      meta: {
        searchQuery: query,
        totalResults: result.pagination.total,
        requestedAt: new Date().toISOString(),
        filters: {
          category,
          tags
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/stats
 * Get article statistics and analytics
 */
router.get('/meta/statistics', async (req, res, next) => {
  try {
    const statistics = await articlesService.getStatistics();

    res.json({
      success: true,
      data: {
        statistics
      },
      meta: {
        requestedAt: new Date().toISOString(),
        description: 'Knowledge base article statistics and analytics'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/articles/:id
 * Get a specific article by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      throw ValidationError.required('id');
    }

    const article = await articlesService.getArticle(id);

    res.json({
      success: true,
      data: {
        article
      },
      meta: {
        requestedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/articles (Not implemented in Phase 2)
 * Create a new article
 */
router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Article creation not implemented in this version',
      timestamp: new Date().toISOString(),
      suggestedAction: 'Use the admin interface to create articles'
    }
  });
});

/**
 * PUT /api/articles/:id (Not implemented in Phase 2)
 * Update an existing article
 */
router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Article updates not implemented in this version',
      timestamp: new Date().toISOString(),
      suggestedAction: 'Use the admin interface to update articles'
    }
  });
});

/**
 * DELETE /api/articles/:id (Not implemented in Phase 2)
 * Delete an article
 */
router.delete('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Article deletion not implemented in this version',
      timestamp: new Date().toISOString(),
      suggestedAction: 'Use the admin interface to delete articles'
    }
  });
});

module.exports = router; 