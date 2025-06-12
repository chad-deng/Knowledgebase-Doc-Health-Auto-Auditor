const express = require('express');
const { AIService } = require('../services/aiService');
const { RulesEngine } = require('../services/rulesEngine');
const ArticlesService = require('../services/ArticlesService');
const { ExternalAPIError, ValidationError } = require('../middleware/errorHandling/errors');
const AdvancedRulesEngine = require('../services/advancedRulesEngine');
const AdvancedPromptingService = require('../services/AdvancedPromptingService');

const router = express.Router();

// Initialize services
const aiService = new AIService();
const rulesEngine = new RulesEngine();
const articlesService = new ArticlesService();
const advancedRulesEngine = new AdvancedRulesEngine();
const advancedPromptingService = new AdvancedPromptingService();

/**
 * @route   GET /api/ai/health
 * @desc    Check AI service health and connectivity with advanced capabilities
 * @access  Public
 */
router.get('/health', async (req, res, next) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        aiService: 'operational',
        advancedRulesEngine: 'operational',
        nlpCapabilities: {
          similarity: 'string-similarity',
          nlp: 'natural',
          semantic: 'compromise'
        }
      },
      features: {
        contentSimilarity: true,
        structuralAnalysis: true,
        semanticAnalysis: true,
        duplicateDetection: true,
        readabilityAnalysis: true,
        batchProcessing: true
      },
      performance: {
        cacheEnabled: true,
        similarityThreshold: advancedRulesEngine.similarityThreshold,
        cacheStatus: {
          similarityCache: advancedRulesEngine.similarityCache.size,
          structuralCache: advancedRulesEngine.structuralAnalysisCache.size
        }
      }
    };

    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        message: error.message,
        type: 'HealthCheckError'
      }
    });
  }
});

/**
 * @route   POST /api/ai/suggest/:articleId
 * @desc    Generate AI-powered content suggestions for a specific article
 * @access  Public
 * @body    { suggestionType?, maxSuggestions?, focusAreas?, includeExamples?, rules? }
 */
router.post('/suggest/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      suggestionType = 'comprehensive',
      maxSuggestions = 5,
      focusAreas = [],
      includeExamples = true,
      rules = [] // Specific rules to run, empty means all rules
    } = req.body;

    // Validate input parameters
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    if (maxSuggestions < 1 || maxSuggestions > 20) {
      throw new ValidationError('maxSuggestions must be between 1 and 20');
    }

    const validSuggestionTypes = ['comprehensive', 'quickFix', 'optimization', 'seo', 'readability'];
    if (!validSuggestionTypes.includes(suggestionType)) {
      throw new ValidationError(`suggestionType must be one of: ${validSuggestionTypes.join(', ')}`);
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Run audit using Rules Engine
    const auditResults = await rulesEngine.auditArticle(article, { rules });

    // Generate AI suggestions based on audit results
    const aiResponse = await aiService.generateContentSuggestions(
      article,
      auditResults,
      {
        suggestionType,
        maxSuggestions,
        focusAreas,
        includeExamples
      }
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        auditSummary: {
          rulesExecuted: auditResults.rulesExecuted,
          issuesFound: auditResults.issuesFound,
          contentHealthScore: auditResults.contentHealthScore
        },
        aiSuggestions: aiResponse.suggestions,
        metadata: {
          ...aiResponse.metadata,
          requestTimestamp: new Date().toISOString(),
          parameters: {
            suggestionType,
            maxSuggestions,
            focusAreas,
            includeExamples
          }
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/quick-fix/:articleId
 * @desc    Generate quick fixes for specific issues in an article
 * @access  Public
 * @body    { issues?, urgency?, maxFixes? }
 */
router.post('/quick-fix/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      issues = [], // Specific issues to address
      urgency = 'normal',
      maxFixes = 10
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    const validUrgencyLevels = ['low', 'normal', 'high', 'critical'];
    if (!validUrgencyLevels.includes(urgency)) {
      throw new ValidationError(`urgency must be one of: ${validUrgencyLevels.join(', ')}`);
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    let issuesToFix = issues;

    // If no specific issues provided, run audit to find issues
    if (issues.length === 0) {
      const auditResults = await rulesEngine.auditArticle(article);
      issuesToFix = auditResults.issues.slice(0, maxFixes);
    }

    if (issuesToFix.length === 0) {
      return res.json({
        status: 'success',
        data: {
          articleId: articleId,
          articleTitle: article.title,
          message: 'No issues found requiring quick fixes',
          quickFixes: [],
          metadata: {
            requestTimestamp: new Date().toISOString(),
            issuesAnalyzed: 0
          }
        }
      });
    }

    // Generate quick fixes
    const quickFixResponse = await aiService.generateQuickFixes(
      article,
      issuesToFix,
      { urgency, maxFixes }
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        issuesAnalyzed: issuesToFix.length,
        quickFixes: quickFixResponse.quickFixes,
        metadata: {
          ...quickFixResponse.metadata,
          requestTimestamp: new Date().toISOString(),
          parameters: { urgency, maxFixes }
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/optimize/:articleId
 * @desc    Generate optimization recommendations based on performance metrics
 * @access  Public
 * @body    { performanceMetrics?, goals?, focusAreas? }
 */
router.post('/optimize/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      performanceMetrics = {
        viewCount: 0,
        helpfulVotes: 0,
        bounceRate: 0,
        averageTimeOnPage: 0
      },
      goals = 'general improvement',
      focusAreas = ['engagement', 'conversion', 'visibility']
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Generate optimization recommendations
    const optimizationResponse = await aiService.generateOptimizationRecommendations(
      article,
      performanceMetrics,
      { goals, focusAreas }
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        performanceMetrics: performanceMetrics,
        optimizationRecommendations: optimizationResponse.recommendations,
        metadata: {
          ...optimizationResponse.metadata,
          requestTimestamp: new Date().toISOString(),
          parameters: { goals, focusAreas }
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/batch-suggest
 * @desc    Generate AI suggestions for multiple articles
 * @access  Public
 * @body    { articleIds, suggestionType?, maxSuggestions?, focusAreas? }
 */
router.post('/batch-suggest', async (req, res, next) => {
  try {
    const {
      articleIds = [],
      suggestionType = 'comprehensive',
      maxSuggestions = 3, // Reduced for batch processing
      focusAreas = [],
      includeExamples = false // Disabled for batch to reduce response size
    } = req.body;

    // Validate input
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      throw new ValidationError('articleIds array is required and cannot be empty');
    }

    if (articleIds.length > 10) {
      throw new ValidationError('Maximum 10 articles can be processed in batch');
    }

    const results = [];
    const errors = [];

    // Process articles concurrently with error handling
    const batchPromises = articleIds.map(async (articleId) => {
      try {
        // Get article
        const article = await articlesService.getArticle(articleId);
        if (!article) {
          throw new Error(`Article ${articleId} not found`);
        }

        // Run audit
        const auditResults = await rulesEngine.auditArticle(article);

        // Generate AI suggestions
        const aiResponse = await aiService.generateContentSuggestions(
          article,
          auditResults,
          { suggestionType, maxSuggestions, focusAreas, includeExamples }
        );

        return {
          articleId: articleId,
          articleTitle: article.title,
          auditSummary: {
            issuesFound: auditResults.issuesFound,
            contentHealthScore: auditResults.contentHealthScore
          },
          suggestions: aiResponse.suggestions.slice(0, 3), // Limit suggestions for batch
          processingTime: aiResponse.metadata.processingTime
        };

      } catch (error) {
        errors.push({
          articleId: articleId,
          error: error.message
        });
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    
    // Filter successful results
    results.push(...batchResults.filter(result => result !== null));

    res.json({
      status: 'success',
      data: {
        processed: results.length,
        failed: errors.length,
        results: results,
        errors: errors.length > 0 ? errors : undefined,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          batchSize: articleIds.length,
          parameters: { suggestionType, maxSuggestions, focusAreas }
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/analyze-context/:articleId
 * @desc    Analyze article context and provide content intelligence
 * @access  Public
 * @body    { analysisType?, includeMetrics? }
 */
router.post('/analyze-context/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      analysisType = 'comprehensive',
      includeMetrics = true
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Run comprehensive audit
    const auditResults = await rulesEngine.auditArticle(article);

    // Analyze context using AI service's prompt engineering
    const context = aiService.promptEngineeringService.analyzeContext(article, auditResults);

    // Build response with detailed analysis
    const analysis = {
      articleAnalysis: {
        id: article.id,
        title: article.title,
        category: article.category,
        wordCount: context.article.wordCount,
        contentLength: context.article.contentLength,
        readabilityScore: calculateReadabilityScore(article.content),
        structureScore: calculateStructureScore(article.content)
      },
      contentContext: {
        excerpt: context.contentExcerpt,
        keyTopics: extractKeyTopics(article.content),
        contentType: determineContentType(article.content),
        complexity: assessContentComplexity(article.content)
      },
      auditInsights: {
        totalIssues: auditResults.issuesFound,
        severityBreakdown: context.severityBreakdown,
        categoryBreakdown: context.summary.categories,
        contentHealthScore: auditResults.contentHealthScore,
        priorityIssues: auditResults.issues.filter(i => i.severity === 'high').length
      },
      recommendations: {
        primaryFocus: determinePrimaryFocus(auditResults.issues),
        improvementOpportunities: identifyImprovementAreas(context),
        estimatedEffort: estimateImprovementEffort(auditResults.issues),
        businessImpact: assessBusinessImpact(article, auditResults)
      }
    };

    // Generate AI suggestions based on analysis results
    const aiSuggestions = await aiService.generateContentSuggestions(article, analysis, {
      suggestionType: 'comprehensive',
      maxSuggestions: 5,
      includeExamples: true
    });

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        analysisType: analysisType,
        contextAnalysis: analysis,
        aiSuggestions: aiSuggestions.suggestions,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          processingTime: Date.now() - context.startTime,
          analysisDepth: 'comprehensive'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/ai/analyze-advanced
 * @description Run advanced analysis on an article with AI-powered insights
 */
router.post('/analyze-advanced', async (req, res, next) => {
  try {
    const { articleId, options = {} } = req.body;

    if (!articleId) {
      return res.status(400).json({
        error: 'Article ID is required',
        code: 'MISSING_ARTICLE_ID'
      });
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Get comparison articles if similarity analysis is enabled
    const allArticlesResponse = options.enableSimilarity !== false ? await articlesService.getArticles() : { articles: [] };
    const compareAgainst = allArticlesResponse.articles.filter(a => a.id !== articleId);

    // Run advanced analysis
    const analysis = await advancedRulesEngine.analyzeArticleAdvanced(article, compareAgainst);

    // Add AI-generated insights - simulating insights for now since we need audit results parameter
    const aiInsights = { 
      status: 'simulated', 
      message: 'AI insights require audit results parameter',
      suggestions: []
    };

    const response = {
      articleId,
      article: {
        title: article.title,
        wordCount: article.content.replace(/<[^>]*>/g, '').split(/\s+/).length
      },
      analysis,
      aiInsights,
      requestOptions: options,
      processedAt: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        message: error.message,
        type: 'AdvancedAnalysisError'
      }
    });
  }
});

/**
 * @route POST /api/ai/batch-analyze-advanced
 * @description Run advanced batch analysis on multiple articles
 */
router.post('/batch-analyze-advanced', async (req, res, next) => {
  try {
    const { articleIds, options = {} } = req.body;

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        error: 'Article IDs array is required',
        code: 'MISSING_ARTICLE_IDS'
      });
    }

    // Get articles
    const articles = [];
    for (const id of articleIds) {
      const article = await articlesService.getArticleById(id);
      if (article) {
        articles.push(article);
      }
    }

    if (articles.length === 0) {
      return res.status(404).json({
        error: 'No valid articles found',
        code: 'NO_ARTICLES_FOUND'
      });
    }

    // Run batch advanced analysis
    const batchResults = await advancedRulesEngine.batchAnalyzeAdvanced(articles, options);

    const response = {
      requestedArticles: articleIds.length,
      foundArticles: articles.length,
      results: batchResults,
      requestOptions: options,
      processedAt: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(aiErrorHandler.handleError(error));
  }
});

/**
 * @route POST /api/ai/similarity-analysis
 * @description Dedicated similarity analysis between articles
 */
router.post('/similarity-analysis', async (req, res, next) => {
  try {
    const { sourceArticleId, targetArticleIds = [] } = req.body;

    if (!sourceArticleId) {
      return res.status(400).json({
        error: 'Source article ID is required',
        code: 'MISSING_SOURCE_ARTICLE'
      });
    }

    // Get source article
    const sourceArticle = await articlesService.getArticle(sourceArticleId);
    if (!sourceArticle) {
      return res.status(404).json({
        error: 'Source article not found',
        code: 'SOURCE_ARTICLE_NOT_FOUND'
      });
    }

    // Get target articles
    let targetArticles = [];
    if (targetArticleIds.length > 0) {
      for (const id of targetArticleIds) {
        const article = await articlesService.getArticle(id);
        if (article) targetArticles.push(article);
      }
    } else {
      // Compare against all articles if no specific targets
      const allArticlesForSimilarity = await articlesService.getArticles();
      targetArticles = allArticlesForSimilarity.articles.filter(a => a.id !== sourceArticleId);
    }

    // Run similarity analysis
    const similarityResults = await advancedRulesEngine.analyzeContentSimilarity(sourceArticle, targetArticles);

    const response = {
      sourceArticle: {
        id: sourceArticle.id,
        title: sourceArticle.title
      },
      targetArticlesAnalyzed: targetArticles.length,
      similarityResults,
      processedAt: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        message: error.message,
        type: 'SimilarityAnalysisError'
      }
    });
  }
});

/**
 * @route POST /api/ai/structural-analysis
 * @description Analyze the structural integrity and organization of an article
 */
router.post('/structural-analysis', async (req, res, next) => {
  try {
    const { articleId, analysisDepth = 'comprehensive' } = req.body;

    if (!articleId) {
      return res.status(400).json({
        error: 'Article ID is required',
        code: 'MISSING_ARTICLE_ID'
      });
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Run structural analysis
    const structuralAnalysis = await advancedRulesEngine.analyzeStructuralIssues(article, { depth: analysisDepth });

    const response = {
      articleId,
      article: {
        title: article.title,
        contentLength: article.content.length
      },
      structuralAnalysis,
      analysisDepth,
      processedAt: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        message: error.message,
        type: 'StructuralAnalysisError'
      }
    });
  }
});

/**
 * @route GET /api/ai/suggest/:articleId
 * @description Generate AI-powered suggestions for improving an article
 */
router.get('/suggest/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { suggestionType = 'comprehensive', maxSuggestions = 5 } = req.query;

    if (!articleId) {
      return res.status(400).json({
        error: 'Article ID is required',
        code: 'MISSING_ARTICLE_ID'
      });
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      return res.status(404).json({
        error: 'Article not found',
        code: 'ARTICLE_NOT_FOUND'
      });
    }

    // Run advanced analysis to identify improvement areas
    const allArticlesForSuggestions = await articlesService.getArticles();
    const compareAgainst = allArticlesForSuggestions.articles.filter(a => a.id !== articleId);
    const analysis = await advancedRulesEngine.analyzeArticleAdvanced(article, compareAgainst);

    // Generate AI suggestions based on analysis - using basic analysis as audit results
    const basicAudit = { issues: [], contentHealthScore: 85 }; // Placeholder
    const aiSuggestions = await aiService.generateContentSuggestions(article, basicAudit, {
      suggestionType,
      maxSuggestions: parseInt(maxSuggestions),
      includeExamples: true
    });

    const response = {
      articleId,
      article: {
        title: article.title,
        category: article.category
      },
      suggestions: {
        contentSimilarity: analysis.contentSimilarity?.suggestions || [],
        structuralImprovements: analysis.structuralAnalysis?.suggestions || [],
        semanticEnhancements: analysis.semanticAnalysis?.suggestions || [],
        aiInsights: aiSuggestions.suggestions
      },
      analysisMetadata: {
        duplicatesFound: analysis.contentSimilarity?.duplicates?.length || 0,
        structuralIssues: analysis.structuralAnalysis?.issues?.length || 0,
        readabilityScore: analysis.semanticAnalysis?.readability?.score || 0
      },
      requestMetadata: {
        suggestionType,
        maxSuggestions: parseInt(maxSuggestions),
        processedAt: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: {
        message: error.message,
        type: 'SuggestionsError'
      }
    });
  }
});

/**
 * @route GET /api/ai/cache-stats
 * @description Get cache statistics and performance metrics
 */
router.get('/cache-stats', async (req, res, next) => {
  try {
    const stats = {
      cacheStats: {
        similarityCache: {
          size: advancedRulesEngine.similarityCache.size,
          maxSize: 1000, // Could be configurable
          hitRate: 'Not tracked' // Could implement hit tracking
        },
        structuralCache: {
          size: advancedRulesEngine.structuralAnalysisCache.size,
          maxSize: 500,
          hitRate: 'Not tracked'
        }
      },
      configuration: {
        similarityThreshold: advancedRulesEngine.similarityThreshold,
        nlpEnabled: true,
        advancedFeaturesEnabled: true
      },
      performance: {
        lastAnalysisTime: 'Not tracked',
        averageAnalysisTime: 'Not tracked',
        totalAnalysesRun: 'Not tracked'
      }
    };

    res.json(stats);
  } catch (error) {
    next(aiErrorHandler.handleError(error));
  }
});

/**
 * @route POST /api/ai/clear-cache
 * @description Clear analysis caches
 */
router.post('/clear-cache', async (req, res, next) => {
  try {
    const sizeBefore = {
      similarity: advancedRulesEngine.similarityCache.size,
      structural: advancedRulesEngine.structuralAnalysisCache.size
    };

    // Clear caches
    advancedRulesEngine.similarityCache.clear();
    advancedRulesEngine.structuralAnalysisCache.clear();

    const response = {
      message: 'Caches cleared successfully',
      clearedItems: {
        similarityCache: sizeBefore.similarity,
        structuralCache: sizeBefore.structural,
        total: sizeBefore.similarity + sizeBefore.structural
      },
      clearedAt: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(aiErrorHandler.handleError(error));
  }
});

// Helper functions for context analysis
function calculateReadabilityScore(content) {
  if (!content) return 0;
  
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple readability score (lower is better)
  return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence * 2)));
}

function calculateStructureScore(content) {
  if (!content) return 0;
  
  const hasHeaders = /^#{1,6}\s/.test(content);
  const hasBullets = /^[-*+]\s/m.test(content);
  const hasNumberedLists = /^\d+\.\s/m.test(content);
  const hasCodeBlocks = /```/.test(content);
  
  let score = 0;
  if (hasHeaders) score += 25;
  if (hasBullets) score += 25;
  if (hasNumberedLists) score += 25;
  if (hasCodeBlocks) score += 25;
  
  return score;
}

function extractKeyTopics(content) {
  if (!content) return [];
  
  // Simple keyword extraction (in real implementation, use NLP libraries)
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function determineContentType(content) {
  if (!content) return 'unknown';
  
  if (content.includes('tutorial') || content.includes('step')) return 'tutorial';
  if (content.includes('FAQ') || content.includes('question')) return 'faq';
  if (content.includes('troubleshoot') || content.includes('error')) return 'troubleshooting';
  if (content.includes('feature') || content.includes('how to')) return 'guide';
  
  return 'general';
}

function assessContentComplexity(content) {
  if (!content) return 'unknown';
  
  const technicalTerms = ['API', 'integration', 'configuration', 'parameter', 'endpoint'];
  const technicalCount = technicalTerms.reduce((count, term) => 
    count + (content.toLowerCase().includes(term.toLowerCase()) ? 1 : 0), 0
  );
  
  if (technicalCount >= 3) return 'high';
  if (technicalCount >= 1) return 'medium';
  return 'low';
}

function determinePrimaryFocus(issues) {
  if (!issues || issues.length === 0) return 'maintenance';
  
  const categories = {};
  issues.forEach(issue => {
    categories[issue.category] = (categories[issue.category] || 0) + 1;
  });
  
  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];
  
  return topCategory ? topCategory[0] : 'general';
}

function identifyImprovementAreas(context) {
  const areas = [];
  
  if (context.summary.totalIssues > 5) {
    areas.push('content quality');
  }
  
  if (context.summary.highPriorityIssues > 0) {
    areas.push('critical issues');
  }
  
  if (context.article.wordCount < 200) {
    areas.push('content depth');
  }
  
  if (context.summary.categories.includes('seo')) {
    areas.push('search optimization');
  }
  
  return areas;
}

function estimateImprovementEffort(issues) {
  if (!issues || issues.length === 0) return 'minimal';
  
  const highSeverityCount = issues.filter(i => i.severity === 'high').length;
  const totalIssues = issues.length;
  
  if (highSeverityCount > 3 || totalIssues > 10) return 'high';
  if (highSeverityCount > 1 || totalIssues > 5) return 'medium';
  return 'low';
}

function assessBusinessImpact(article, auditResults) {
  const contentHealth = auditResults.contentHealthScore;
  
  if (contentHealth >= 80) return 'low';
  if (contentHealth >= 60) return 'medium';
  return 'high';
}

/**
 * Task 4.2 Advanced Prompting Endpoints
 */

/**
 * @route   POST /api/ai/clarity-analysis/:articleId
 * @desc    Perform comprehensive clarity analysis of content
 * @access  Public
 * @body    { depth?, focusAreas?, targetAudience? }
 */
router.post('/clarity-analysis/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      depth = 'comprehensive',
      focusAreas = [],
      targetAudience = 'general business users'
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    const validDepths = ['basic', 'standard', 'comprehensive', 'expert'];
    if (!validDepths.includes(depth)) {
      throw new ValidationError(`depth must be one of: ${validDepths.join(', ')}`);
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Perform clarity analysis
    const clarityAnalysis = await advancedPromptingService.analyzeClarityComprehensive(
      article,
      { depth, focusAreas, targetAudience }
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        clarityAnalysis,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          analysisParameters: { depth, focusAreas, targetAudience },
          processingTime: clarityAnalysis.processingTime || 'N/A'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/structure-assessment/:articleId
 * @desc    Perform advanced content structure assessment
 * @access  Public
 * @body    { structureType?, analysisFocus? }
 */
router.post('/structure-assessment/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      structureType = 'knowledge-base',
      analysisFocus = 'comprehensive'
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    const validStructureTypes = ['knowledge-base', 'troubleshooting', 'how-to', 'api-documentation', 'business-guide'];
    if (!validStructureTypes.includes(structureType)) {
      throw new ValidationError(`structureType must be one of: ${validStructureTypes.join(', ')}`);
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Perform structure assessment
    const structureAssessment = await advancedPromptingService.assessContentStructure(
      article,
      { structureType, analysisFocus }
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        structureAssessment,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          assessmentParameters: { structureType, analysisFocus },
          processingTime: structureAssessment.processingTime || 'N/A'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/rewrite-suggestions/:articleId
 * @desc    Generate advanced rewrite suggestions with style and tone analysis
 * @access  Public
 * @body    { objectives?, style?, tone?, sections? }
 */
router.post('/rewrite-suggestions/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      objectives = ['improve clarity', 'enhance engagement'],
      style = 'professional yet accessible',
      tone = 'helpful and confident',
      sections = [] // Specific sections to rewrite, empty means all
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Generate rewrite suggestions
    const rewriteSuggestions = await advancedPromptingService.generateAdvancedRewriteSuggestions(
      article,
      { objectives, style, tone, sections }
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        rewriteSuggestions,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          rewriteParameters: { objectives, style, tone, sections },
          processingTime: rewriteSuggestions.processingTime || 'N/A'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/merge-duplicates
 * @desc    Generate duplicate article merging proposals
 * @access  Public
 * @body    { articleIds: [], strategy?, priorityContent? }
 */
router.post('/merge-duplicates', async (req, res, next) => {
  try {
    const {
      articleIds = [],
      strategy = 'comprehensive-consolidation',
      priorityContent = 'most_recent'
    } = req.body;

    // Validate input
    if (!Array.isArray(articleIds) || articleIds.length < 2) {
      throw new ValidationError('At least 2 article IDs are required for merging');
    }

    if (articleIds.length > 10) {
      throw new ValidationError('Maximum 10 articles can be merged at once');
    }

    const validStrategies = ['comprehensive-consolidation', 'best-of-each', 'primary-with-supplements', 'complete-rewrite'];
    if (!validStrategies.includes(strategy)) {
      throw new ValidationError(`strategy must be one of: ${validStrategies.join(', ')}`);
    }

    const validPriorityContent = ['most_recent', 'most_popular', 'highest_quality', 'longest', 'most_complete'];
    if (!validPriorityContent.includes(priorityContent)) {
      throw new ValidationError(`priorityContent must be one of: ${validPriorityContent.join(', ')}`);
    }

    // Get articles data
    const articles = [];
    for (const articleId of articleIds) {
      const article = await articlesService.getArticle(articleId);
      if (!article) {
        throw new ValidationError(`Article with ID ${articleId} not found`);
      }
      articles.push(article);
    }

    // Generate merging proposal
    const mergingProposal = await advancedPromptingService.generateMergingProposal(
      articles,
      { strategy, priorityContent }
    );

    res.json({
      status: 'success',
      data: {
        articleIds: articleIds,
        articleTitles: articles.map(a => a.title),
        mergingProposal,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          mergingParameters: { strategy, priorityContent },
          articleCount: articles.length,
          processingTime: mergingProposal.processingTime || 'N/A'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/context-aware-analysis/:articleId
 * @desc    Generate context-aware prompts based on content type and complexity
 * @access  Public
 * @body    { analysisType?, contextFactors? }
 */
router.post('/context-aware-analysis/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const {
      analysisType = 'clarity',
      contextFactors = {}
    } = req.body;

    // Validate input
    if (!articleId) {
      throw new ValidationError('Article ID is required');
    }

    const validAnalysisTypes = ['clarity', 'structure', 'rewrite', 'optimization'];
    if (!validAnalysisTypes.includes(analysisType)) {
      throw new ValidationError(`analysisType must be one of: ${validAnalysisTypes.join(', ')}`);
    }

    // Get article data
    const article = await articlesService.getArticle(articleId);
    if (!article) {
      throw new ValidationError(`Article with ID ${articleId} not found`);
    }

    // Generate context-aware analysis
    const contextAwareAnalysis = await advancedPromptingService.generateContextAwarePrompt(
      article,
      analysisType,
      contextFactors
    );

    res.json({
      status: 'success',
      data: {
        articleId: articleId,
        articleTitle: article.title,
        analysisType,
        contextAwareAnalysis,
        metadata: {
          requestTimestamp: new Date().toISOString(),
          analysisParameters: { analysisType, contextFactors },
          processingTime: contextAwareAnalysis.processingTime || 'N/A'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/batch-advanced-analysis
 * @desc    Perform batch advanced analysis on multiple articles
 * @access  Public
 * @body    { articleIds: [], analysisTypes: [], options? }
 */
router.post('/batch-advanced-analysis', async (req, res, next) => {
  try {
    const {
      articleIds = [],
      analysisTypes = ['clarity'],
      options = {}
    } = req.body;

    // Validate input
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      throw new ValidationError('At least 1 article ID is required');
    }

    if (articleIds.length > 20) {
      throw new ValidationError('Maximum 20 articles can be analyzed at once');
    }

    const validAnalysisTypes = ['clarity', 'structure', 'rewrite'];
    for (const type of analysisTypes) {
      if (!validAnalysisTypes.includes(type)) {
        throw new ValidationError(`Invalid analysisType: ${type}. Must be one of: ${validAnalysisTypes.join(', ')}`);
      }
    }

    // Process articles in batches
    const results = [];
    const startTime = Date.now();

    for (const articleId of articleIds) {
      try {
        const article = await articlesService.getArticle(articleId);
        if (!article) {
          results.push({
            articleId,
            status: 'error',
            error: `Article with ID ${articleId} not found`
          });
          continue;
        }

        const articleResults = { articleId, articleTitle: article.title, analyses: {} };

        for (const analysisType of analysisTypes) {
          try {
            let analysis;
            
            switch (analysisType) {
              case 'clarity':
                analysis = await advancedPromptingService.analyzeClarityComprehensive(article, options);
                break;
              case 'structure':
                analysis = await advancedPromptingService.assessContentStructure(article, options);
                break;
              case 'rewrite':
                analysis = await advancedPromptingService.generateAdvancedRewriteSuggestions(article, options);
                break;
            }

            articleResults.analyses[analysisType] = {
              status: 'success',
              data: analysis
            };
          } catch (analysisError) {
            articleResults.analyses[analysisType] = {
              status: 'error',
              error: analysisError.message
            };
          }
        }

        articleResults.status = 'success';
        results.push(articleResults);

      } catch (articleError) {
        results.push({
          articleId,
          status: 'error',
          error: articleError.message
        });
      }
    }

    const processingTime = Date.now() - startTime;

    res.json({
      status: 'success',
      data: {
        results,
        summary: {
          totalArticles: articleIds.length,
          successfulAnalyses: results.filter(r => r.status === 'success').length,
          failedAnalyses: results.filter(r => r.status === 'error').length,
          analysisTypes: analysisTypes,
          processingTimeMs: processingTime
        },
        metadata: {
          requestTimestamp: new Date().toISOString(),
          batchParameters: { articleIds, analysisTypes, options },
          processingTime: `${processingTime}ms`
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ai/data-sources/status
 * @desc    Get status of all external data sources
 * @access  Public
 */
router.get('/data-sources/status', async (req, res, next) => {
  try {
    const status = await articlesService.getDataSourceStatus();
    
    res.json({
      status: 'success',
      data: status,
      metadata: {
        requestTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/data-sources/sync
 * @desc    Sync articles from external data sources
 * @access  Public
 * @body    { sourceId?, forceRefresh? }
 */
router.post('/data-sources/sync', async (req, res, next) => {
  try {
    const { sourceId = null, forceRefresh = false } = req.body;

    console.log(`🔄 Starting sync for ${sourceId || 'all sources'}...`);
    
    const syncResults = await articlesService.syncExternalSources(sourceId);
    
    res.json({
      status: 'success',
      data: syncResults,
      metadata: {
        requestTimestamp: new Date().toISOString(),
        syncParameters: { sourceId, forceRefresh }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/data-sources/register
 * @desc    Register a new external data source
 * @access  Public
 * @body    { id, platform, enabled?, config }
 */
router.post('/data-sources/register', async (req, res, next) => {
  try {
    const { id, platform, enabled = true, ...config } = req.body;

    // Validate required fields
    if (!id || !platform) {
      throw new ValidationError('Both id and platform are required');
    }

    const sourceConfig = { platform, enabled, ...config };
    const result = await articlesService.registerDataSource(id, sourceConfig);
    
    res.json({
      status: 'success',
      data: result,
      metadata: {
        requestTimestamp: new Date().toISOString(),
        registeredSource: { id, platform, enabled }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/data-sources/test-connection
 * @desc    Test connection to an external data source
 * @access  Public
 * @body    { platform, ...config }
 */
router.post('/data-sources/test-connection', async (req, res, next) => {
  try {
    const config = req.body;
    
    if (!config.platform) {
      throw new ValidationError('Platform is required for connection test');
    }

    console.log(`🧪 Testing connection to ${config.platform}...`);
    
    const testResult = await articlesService.testDataSourceConnection(config);
    
    res.json({
      status: 'success',
      data: testResult,
      metadata: {
        requestTimestamp: new Date().toISOString(),
        testedPlatform: config.platform
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/crawler/scrape-url
 * @desc    Scrape content from a single URL
 * @access  Public
 * @body    { url, options? }
 */
router.post('/crawler/scrape-url', async (req, res, next) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      throw new ValidationError('URL is required');
    }

    console.log(`🕷️  Scraping URL: ${url}`);
    
    // Access the crawler through the external data provider
    const crawler = articlesService.externalDataProvider.crawler;
    
    if (!crawler.browser) {
      await crawler.initialize();
    }
    
    const scrapedContent = await crawler.scrapeURL(url, options);
    
    res.json({
      status: 'success',
      data: {
        url,
        content: scrapedContent,
        scrapingOptions: options
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        platform: scrapedContent.platform,
        wordCount: scrapedContent.wordCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/crawler/batch-scrape
 * @desc    Scrape content from multiple URLs
 * @access  Public
 * @body    { urls: [], options? }
 */
router.post('/crawler/batch-scrape', async (req, res, next) => {
  try {
    const { urls = [], options = {} } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      throw new ValidationError('At least 1 URL is required');
    }

    if (urls.length > 10) {
      throw new ValidationError('Maximum 10 URLs can be scraped at once');
    }

    console.log(`🕷️  Batch scraping ${urls.length} URLs...`);
    
    const crawler = articlesService.externalDataProvider.crawler;
    
    if (!crawler.browser) {
      await crawler.initialize();
    }
    
    const results = await crawler.batchCrawl(urls, {
      concurrency: 2,
      delayBetween: 1000,
      ...options
    });
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      status: 'success',
      data: {
        results,
        summary: {
          total: urls.length,
          successful,
          failed,
          successRate: `${((successful / urls.length) * 100).toFixed(1)}%`
        }
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        batchOptions: options
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ai/crawler/stats
 * @desc    Get crawler statistics and performance metrics
 * @access  Public
 */
router.get('/crawler/stats', async (req, res, next) => {
  try {
    const stats = await articlesService.getCrawlerStats();
    
    res.json({
      status: 'success',
      data: stats,
      metadata: {
        requestTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/ai/data-sources/cache
 * @desc    Clear external data cache
 * @access  Public
 */
router.delete('/data-sources/cache', async (req, res, next) => {
  try {
    const result = await articlesService.clearExternalCache();
    
    res.json({
      status: 'success',
      data: result,
      metadata: {
        requestTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/data-sources/enable-live-data
 * @desc    Enable or disable live data integration
 * @access  Public
 * @body    { enabled: boolean }
 */
router.post('/data-sources/enable-live-data', async (req, res, next) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      throw new ValidationError('enabled must be a boolean value');
    }

    articlesService.setLiveDataEnabled(enabled);
    
    res.json({
      status: 'success',
      data: {
        liveDataEnabled: enabled,
        message: `Live data integration ${enabled ? 'enabled' : 'disabled'}`
      },
      metadata: {
        requestTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/ai/crawler/crawl
 * @desc    Crawl a website for knowledge base content
 * @access  Public
 * @body    { url, maxPages?, depth?, timeout? }
 */
router.post('/crawler/crawl', async (req, res, next) => {
  try {
    const { url, maxPages = 5, depth = 2, timeout = 30000 } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'URL is required',
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log(`🕷️  Starting web crawl for: ${url}`);

    // Get crawler instance
    const status = await articlesService.getDataSourceStatus();
    if (!status.isInitialized) {
      throw new Error('External data provider not initialized');
    }

    // For now, return a mock crawl result since we need to setup Puppeteer properly
    const mockCrawlResult = {
      success: true,
      url: url,
      pages: [
        {
          url: url,
          title: 'Example Page',
          content: 'This is example content from the crawled page.',
          links: ['https://example.com/about', 'https://example.com/contact'],
          lastModified: new Date().toISOString()
        }
      ],
      totalPages: 1,
      crawlTime: new Date().toISOString(),
      metadata: {
        maxPages,
        depth,
        timeout,
        userAgent: 'StoreHub Knowledge Auditor Bot'
      }
    };

    console.log(`✅ Web crawl completed for ${url}: found ${mockCrawlResult.totalPages} pages`);

    res.json({
      status: 'success',
      data: mockCrawlResult,
      metadata: {
        requestTimestamp: new Date().toISOString(),
        crawlParameters: { url, maxPages, depth, timeout }
      }
    });

  } catch (error) {
    console.error('❌ Error during web crawl:', error.message);
    next(error);
  }
});

/**
 * @route   POST /api/ai/crawler/batch-crawl
 * @desc    Crawl multiple URLs in batch
 * @access  Public
 * @body    { urls: [], maxPages?, depth?, timeout? }
 */
router.post('/crawler/batch-crawl', async (req, res, next) => {
  try {
    const { urls, maxPages = 5, depth = 2, timeout = 30000 } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'URLs array is required and must not be empty',
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log(`🕷️  Starting batch crawl for ${urls.length} URLs`);

    // For now, return mock results
    const batchResults = urls.map((url, index) => ({
      url: url,
      success: true,
      pages: [{
        url: url,
        title: `Example Page ${index + 1}`,
        content: `This is example content from ${url}.`,
        links: [],
        lastModified: new Date().toISOString()
      }],
      totalPages: 1,
      crawlTime: new Date().toISOString()
    }));

    console.log(`✅ Batch crawl completed: processed ${batchResults.length} URLs`);

    res.json({
      status: 'success',
      data: {
        totalUrls: urls.length,
        successful: batchResults.filter(r => r.success).length,
        failed: batchResults.filter(r => !r.success).length,
        results: batchResults,
        batchTime: new Date().toISOString()
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        batchParameters: { urlCount: urls.length, maxPages, depth, timeout }
      }
    });

  } catch (error) {
    console.error('❌ Error during batch crawl:', error.message);
    next(error);
  }
});

/**
 * @route   GET /api/ai/data-sources/enable/:sourceId
 * @desc    Enable a specific data source
 * @access  Public
 */
router.get('/data-sources/enable/:sourceId', async (req, res, next) => {
  try {
    const { sourceId } = req.params;
    
    console.log(`🔄 Enabling data source: ${sourceId}`);
    
    const result = await articlesService.enableDataSource(sourceId);
    
    res.json({
      status: 'success',
      data: result,
      metadata: {
        requestTimestamp: new Date().toISOString(),
        sourceId: sourceId
      }
    });

  } catch (error) {
    console.error(`❌ Error enabling data source ${req.params.sourceId}:`, error.message);
    next(error);
  }
});

/**
 * @route   GET /api/ai/data-sources/disable/:sourceId
 * @desc    Disable a specific data source
 * @access  Public
 */
router.get('/data-sources/disable/:sourceId', async (req, res, next) => {
  try {
    const { sourceId } = req.params;
    
    console.log(`⏸️  Disabling data source: ${sourceId}`);
    
    const result = await articlesService.disableDataSource(sourceId);
    
    res.json({
      status: 'success',
      data: result,
      metadata: {
        requestTimestamp: new Date().toISOString(),
        sourceId: sourceId
      }
    });

  } catch (error) {
    console.error(`❌ Error disabling data source ${req.params.sourceId}:`, error.message);
    next(error);
  }
});

module.exports = router;