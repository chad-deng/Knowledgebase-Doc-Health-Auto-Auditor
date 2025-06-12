const express = require('express');
const { RulesEngine } = require('../services/rulesEngine');
const ArticlesService = require('../services/articlesService');
const ArticlesErrorHandler = require('../middleware/errorHandling/domainHandlers/ArticlesErrorHandler');

const router = express.Router();
const rulesEngine = new RulesEngine();
const articlesService = new ArticlesService();
const articlesErrorHandler = new ArticlesErrorHandler();

/**
 * @route GET /api/audit/rules
 * @description Get all available rules with their configurations
 * @returns {Object} List of available rules
 */
router.get('/rules', async (req, res, next) => {
  try {
    const rules = rulesEngine.getRules();
    
    res.json({
      success: true,
      message: 'Rules retrieved successfully',
      data: {
        totalRules: rules.length,
        rules: rules,
        categories: rulesEngine.getRulesByCategory()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const enhancedError = await articlesErrorHandler.process(error, req);
    res.status(enhancedError.statusCode || 500).json({
      success: false,
      message: enhancedError.userMessage || 'Failed to retrieve rules',
      error: enhancedError,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/audit/rules/:ruleId
 * @description Get specific rule details
 * @param {string} ruleId - Rule identifier
 * @returns {Object} Rule details and metadata
 */
router.get('/rules/:ruleId', async (req, res, next) => {
  try {
    const { ruleId } = req.params;
    const rule = rulesEngine.getRule(ruleId);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: `Rule '${ruleId}' not found`,
        error: {
          type: 'RULE_NOT_FOUND',
          details: `No rule with ID '${ruleId}' exists in the system`
        },
        suggestions: [
          'Check the rule ID spelling',
          'Use GET /api/audit/rules to see available rules',
          'Verify the rule is properly registered'
        ],
        timestamp: new Date().toISOString()
      });
    }

    const ruleInfo = rulesEngine.ruleRegistry.getRuleInfo(ruleId);
    
    res.json({
      success: true,
      message: 'Rule details retrieved successfully',
      data: {
        rule: rule.getMetadata(),
        registryInfo: ruleInfo
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const enhancedError = await articlesErrorHandler.process(error, req);
    res.status(enhancedError.statusCode || 500).json({
      success: false,
      message: enhancedError.userMessage || 'Failed to get rule details',
      error: enhancedError,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/audit/rules/:ruleId/config
 * @description Update rule configuration
 * @param {string} ruleId - Rule identifier
 * @body {Object} config - New configuration options
 * @returns {Object} Updated rule configuration
 */
router.post('/rules/:ruleId/config', async (req, res, next) => {
  try {
    const { ruleId } = req.params;
    const { config } = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid configuration provided',
        error: {
          type: 'INVALID_CONFIG',
          details: 'Configuration must be a valid object'
        },
        suggestions: [
          'Provide configuration as a JSON object',
          'Check rule documentation for valid config options',
          'Ensure all required config fields are included'
        ],
        timestamp: new Date().toISOString()
      });
    }

    const updatedRule = rulesEngine.updateRuleConfig(ruleId, config);
    
    res.json({
      success: true,
      message: 'Rule configuration updated successfully',
      data: {
        ruleId,
        updatedConfig: updatedRule.config,
        metadata: updatedRule.getMetadata()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const enhancedError = await articlesErrorHandler.process(error, req);
    res.status(enhancedError.statusCode || 500).json({
      success: false,
      message: enhancedError.userMessage || 'Failed to update rule configuration',
      error: enhancedError,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/audit/article/:articleId
 * @description Audit a specific article using all or selected rules
 * @param {string} articleId - Article identifier
 * @body {Object} options - Audit options (rules, severity filter, etc.)
 * @returns {Object} Audit results with identified issues
 */
router.post('/article/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { rules: selectedRules, minSeverity, includeMetadata = true } = req.body;
    
    // Get the article
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: `Article '${articleId}' not found`,
        error: {
          type: 'ARTICLE_NOT_FOUND',
          details: `No article with ID '${articleId}' exists`
        },
        suggestions: [
          'Check the article ID spelling',
          'Use GET /api/articles to see available articles',
          'Verify the article exists in the system'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Audit the article
    const auditResult = await rulesEngine.executeRules(article, selectedRules);
    
    // Filter by severity if specified
    if (minSeverity) {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const minSeverityLevel = severityOrder[minSeverity.toLowerCase()] || 1;
      
      auditResult.issues = auditResult.issues.filter(issue => {
        const issueSeverity = severityOrder[issue.severity?.toLowerCase()] || 2;
        return issueSeverity >= minSeverityLevel;
      });
      auditResult.issuesFound = auditResult.issues.length;
    }

    res.json({
      success: true,
      message: `Article audit completed - found ${auditResult.issuesFound} issues`,
      data: {
        audit: auditResult,
        article: includeMetadata ? {
          id: article.id,
          title: article.title,
          category: article.category,
          lastModified: article.lastModified
        } : { id: article.id }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const enhancedError = await articlesErrorHandler.process(error, req);
    res.status(enhancedError.statusCode || 500).json({
      success: false,
      message: enhancedError.userMessage || 'Failed to audit article',
      error: enhancedError,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/audit/articles
 * @description Audit multiple articles
 * @body {Object} options - Audit options (articles, rules, filters, etc.)
 * @returns {Object} Batch audit results
 */
router.post('/articles', async (req, res, next) => {
  try {
    const { 
      articleIds, 
      category, 
      rules: selectedRules, 
      minSeverity,
      limit = 10,
      includeContent = false 
    } = req.body;
    
    let articles = [];
    
    if (articleIds && Array.isArray(articleIds)) {
      // Audit specific articles
      articles = await Promise.all(
        articleIds.map(async id => {
          try {
            return await articlesService.getArticle(id);
          } catch (error) {
            return null; // Article not found
          }
        })
      );
      articles = articles.filter(Boolean); // Remove null/undefined articles
    } else if (category) {
      // Audit articles by category
      const categoryResults = await articlesService.getArticles({ category });
      articles = categoryResults.articles;
    } else {
      // Audit all articles (with limit)
      const allArticles = await articlesService.getArticles();
      articles = allArticles.articles.slice(0, Math.min(limit, 50)); // Max 50 articles
    }

    if (articles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No articles found to audit',
        error: {
          type: 'NO_ARTICLES_FOUND',
          details: 'No articles match the specified criteria'
        },
        suggestions: [
          'Check article IDs or category name',
          'Use GET /api/articles to see available articles',
          'Ensure articles exist in the specified category'
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Perform batch audit
    const batchResult = await rulesEngine.auditMultipleArticles(articles, selectedRules);
    
    // Apply severity filtering
    if (minSeverity) {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const minSeverityLevel = severityOrder[minSeverity.toLowerCase()] || 1;
      
      batchResult.results = batchResult.results.map(result => ({
        ...result,
        issues: result.issues.filter(issue => {
          const issueSeverity = severityOrder[issue.severity?.toLowerCase()] || 2;
          return issueSeverity >= minSeverityLevel;
        })
      }));
      
      // Recalculate totals
      batchResult.totalIssues = batchResult.results.reduce((sum, r) => sum + r.issues.length, 0);
    }

    // Generate summary statistics
    const summary = {
      articlesWithIssues: batchResult.results.filter(r => r.issuesFound > 0).length,
      averageIssuesPerArticle: Math.round((batchResult.totalIssues / batchResult.totalArticles) * 10) / 10,
      severityBreakdown: calculateSeverityBreakdown(batchResult.results),
      categoryBreakdown: calculateCategoryBreakdown(batchResult.results),
      mostCommonIssues: findMostCommonIssues(batchResult.results)
    };

    res.json({
      success: true,
      message: `Batch audit completed - ${batchResult.totalArticles} articles, ${batchResult.totalIssues} total issues`,
      data: {
        audit: batchResult,
        summary,
        meta: {
          articlesRequested: articleIds?.length || articles.length,
          articlesAudited: batchResult.totalArticles,
          rulesExecuted: selectedRules?.length || rulesEngine.getRules().length,
          includeContent
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const enhancedError = await articlesErrorHandler.process(error, req);
    res.status(enhancedError.statusCode || 500).json({
      success: false,
      message: enhancedError.userMessage || 'Failed to audit multiple articles',
      error: enhancedError,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/audit/stats
 * @description Get audit statistics and system health
 * @returns {Object} System audit statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const rules = rulesEngine.getRules();
    const allArticles = await articlesService.getArticles();
    
    // Quick audit sample for stats (limit to 10 articles)
    const sampleArticles = allArticles.articles.slice(0, 10);
    const sampleAudit = await rulesEngine.auditMultipleArticles(sampleArticles);
    
    const stats = {
      rulesEngine: {
        totalRules: rules.length,
        enabledRules: rules.filter(r => r.enabled).length,
        ruleCategories: Object.keys(rulesEngine.getRulesByCategory()).length,
        configurableRules: rules.filter(r => r.configurable).length
      },
      content: {
        totalArticles: allArticles.totalArticles,
        categories: allArticles.categories?.length || 0,
        tags: allArticles.tags?.length || 0
      },
      sampleAudit: {
        articlesChecked: sampleAudit.totalArticles,
        issuesFound: sampleAudit.totalIssues,
        averageIssuesPerArticle: Math.round((sampleAudit.totalIssues / sampleAudit.totalArticles) * 10) / 10,
        healthScore: Math.max(0, 100 - (sampleAudit.totalIssues / sampleAudit.totalArticles * 10))
      }
    };

    res.json({
      success: true,
      message: 'Audit statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const enhancedError = await articlesErrorHandler.process(error, req);
    res.status(enhancedError.statusCode || 500).json({
      success: false,
      message: enhancedError.userMessage || 'Failed to get audit statistics',
      error: enhancedError,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper methods (would typically be in a utils class)
function calculateSeverityBreakdown(results) {
  const breakdown = { low: 0, medium: 0, high: 0, critical: 0 };
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      const severity = issue.severity?.toLowerCase() || 'medium';
      if (breakdown.hasOwnProperty(severity)) {
        breakdown[severity]++;
      }
    });
  });
  
  return breakdown;
}

function calculateCategoryBreakdown(results) {
  const breakdown = {};
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      const category = issue.category || 'general';
      breakdown[category] = (breakdown[category] || 0) + 1;
    });
  });
  
  return breakdown;
}

function findMostCommonIssues(results, limit = 5) {
  const issueCounts = {};
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      const issueType = issue.issue || 'Unknown issue';
      issueCounts[issueType] = (issueCounts[issueType] || 0) + 1;
    });
  });
  
  return Object.entries(issueCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([issue, count]) => ({ issue, count }));
}

// Helper functions are available in scope for route handlers

module.exports = router; 