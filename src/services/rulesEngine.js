const { ServiceError } = require('../middleware/errorHandling/errors');

/**
 * Rules Engine - Hybrid Plugin-Configuration System
 * Analyzes knowledge base articles and identifies content issues
 */
class RulesEngine {
  constructor() {
    this.rules = new Map();
    this.ruleRegistry = new RuleRegistry();
    this.loadBuiltInRules();
  }

  /**
   * Load built-in rules during initialization
   */
  loadBuiltInRules() {
    // Import and register built-in rules
    const OutdatedContentRule = require('./rules/OutdatedContentRule');
    const BrokenLinksRule = require('./rules/BrokenLinksRule');
    const ContentQualityRule = require('./rules/ContentQualityRule');
    const DuplicateContentRule = require('./rules/DuplicateContentRule');
    const SEOOptimizationRule = require('./rules/SEOOptimizationRule');

    // Register rules with configuration
    this.registerRule(new OutdatedContentRule());
    this.registerRule(new BrokenLinksRule());
    this.registerRule(new ContentQualityRule());
    this.registerRule(new DuplicateContentRule());
    this.registerRule(new SEOOptimizationRule());
  }

  /**
   * Register a new rule in the system
   */
  registerRule(rule) {
    if (!rule.id || !rule.execute) {
      throw new Error('Invalid rule: must have id and execute method');
    }
    
    this.rules.set(rule.id, rule);
    this.ruleRegistry.register(rule);
  }

  /**
   * Execute rules against an article
   */
  async executeRules(article, ruleIds = null) {
    try {
      const context = new ExecutionContext(article);
      const rulesToExecute = ruleIds ? 
        ruleIds.map(id => this.rules.get(id)).filter(Boolean) :
        Array.from(this.rules.values());

      const results = [];

      for (const rule of rulesToExecute) {
        if (rule.enabled !== false) {
          try {
            const result = await rule.execute(context);
            if (result) {
              results.push({
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity || 'medium',
                category: rule.category,
                ...result
              });
            }
          } catch (error) {
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: 'error',
              category: 'system',
              issue: 'Rule execution failed',
              description: `Failed to execute rule: ${error.message}`,
              suggestions: ['Check rule configuration and try again']
            });
          }
        }
      }

      return {
        articleId: article.id,
        totalRulesExecuted: rulesToExecute.length,
        issuesFound: results.length,
        issues: results,
        executionTime: Date.now() - context.startTime
      };
    } catch (error) {
      throw ServiceError.rules('executeRules', 'Failed to execute rules', error);
    }
  }

  /**
   * Execute rules against multiple articles
   */
  async auditMultipleArticles(articles, ruleIds = null) {
    try {
      const results = [];
      
      for (const article of articles) {
        const auditResult = await this.executeRules(article, ruleIds);
        results.push(auditResult);
      }

      return {
        totalArticles: articles.length,
        totalIssues: results.reduce((sum, r) => sum + r.issuesFound, 0),
        results,
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      throw ServiceError.rules('auditMultipleArticles', 'Failed to audit multiple articles', error);
    }
  }

  /**
   * Get available rules with their configurations
   */
  getRules() {
    return Array.from(this.rules.values()).map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      category: rule.category,
      severity: rule.severity,
      enabled: rule.enabled !== false,
      configurable: rule.configurable || false
    }));
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId) {
    return this.rules.get(ruleId);
  }

  /**
   * Update rule configuration
   */
  updateRuleConfig(ruleId, config) {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule with ID '${ruleId}' not found`);
    }

    if (rule.updateConfig) {
      rule.updateConfig(config);
    }

    return rule;
  }

  /**
   * Get rules grouped by category
   */
  getRulesByCategory() {
    const categories = {};
    
    for (const rule of this.rules.values()) {
      const category = rule.category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        severity: rule.severity,
        enabled: rule.enabled !== false
      });
    }

    return categories;
  }
}

/**
 * Rule Registry - Manages rule metadata and discovery
 */
class RuleRegistry {
  constructor() {
    this.registry = new Map();
  }

  register(rule) {
    this.registry.set(rule.id, {
      id: rule.id,
      name: rule.name,
      version: rule.version || '1.0.0',
      author: rule.author || 'System',
      description: rule.description,
      category: rule.category,
      tags: rule.tags || [],
      dependencies: rule.dependencies || [],
      registeredAt: new Date().toISOString()
    });
  }

  getRuleInfo(ruleId) {
    return this.registry.get(ruleId);
  }

  getAllRules() {
    return Array.from(this.registry.values());
  }

  findRulesByCategory(category) {
    return Array.from(this.registry.values())
      .filter(rule => rule.category === category);
  }

  findRulesByTag(tag) {
    return Array.from(this.registry.values())
      .filter(rule => rule.tags.includes(tag));
  }
}

/**
 * Execution Context - Provides article data and utilities to rules
 */
class ExecutionContext {
  constructor(article) {
    this.article = article;
    this.startTime = Date.now();
    this.metadata = {
      contentLength: article.content ? article.content.length : 0,
      wordCount: article.content ? article.content.split(/\s+/).length : 0,
      hasImages: this.checkForImages(article.content),
      hasLinks: this.checkForLinks(article.content),
      lastModified: new Date(article.lastModified),
      age: this.calculateAge(article.lastModified)
    };
  }

  checkForImages(content) {
    if (!content) return false;
    return /!\[.*?\]\(.*?\)|<img.*?>/i.test(content);
  }

  checkForLinks(content) {
    if (!content) return false;
    return /\[.*?\]\(.*?\)|<a.*?href.*?>/i.test(content);
  }

  calculateAge(lastModified) {
    const now = new Date();
    const modified = new Date(lastModified);
    const diffTime = Math.abs(now - modified);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }

  getContentWords() {
    if (!this.article.content) return [];
    return this.article.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  getContentSentences() {
    if (!this.article.content) return [];
    return this.article.content
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  extractLinks() {
    if (!this.article.content) return [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(this.article.content)) !== null) {
      links.push({
        text: match[1],
        url: match[2]
      });
    }
    
    return links;
  }
}

module.exports = { RulesEngine, RuleRegistry, ExecutionContext }; 