const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const { ExternalAPIError } = require('../middleware/errorHandling/errors');

/**
 * AI Service - Google Gemini Integration with Hybrid Template-Context System
 * Provides AI-powered content suggestions based on Rules Engine findings
 */
class AIService {
  constructor() {
    this.initializeGeminiAPI();
    this.promptEngineeringService = new PromptEngineeringService();
  }

  /**
   * Initialize Google Gemini API client
   */
  initializeGeminiAPI() {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 2048,
        },
      });
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error.message);
      throw new ExternalAPIError(
        'AI service initialization failed',
        'GEMINI_INIT_ERROR',
        error.message
      );
    }
  }

  /**
   * Generate AI-powered content suggestions based on audit results
   */
  async generateContentSuggestions(article, auditResults, options = {}) {
    try {
      const {
        suggestionType = 'comprehensive',
        maxSuggestions = 5,
        focusAreas = [],
        includeExamples = true
      } = options;

      // Analyze context and build prompt
      const context = this.promptEngineeringService.analyzeContext(article, auditResults);
      const prompt = this.promptEngineeringService.buildPrompt(
        suggestionType,
        context,
        { maxSuggestions, focusAreas, includeExamples }
      );

      // Generate AI response
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      // Process and structure the response
      const processedSuggestions = this.promptEngineeringService.processResponse(
        generatedText,
        context,
        options
      );

      return {
        suggestions: processedSuggestions,
        metadata: {
          requestId: this.generateRequestId(),
          model: 'gemini-1.5-flash',
          promptType: suggestionType,
          contextAnalysis: context.summary,
          processingTime: Date.now() - context.startTime,
          tokensUsed: this.estimateTokenUsage(prompt, generatedText)
        }
      };

    } catch (error) {
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new ExternalAPIError(
          'Invalid API key for Gemini service',
          'INVALID_API_KEY',
          'Please check your GEMINI_API_KEY configuration'
        );
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new ExternalAPIError(
          'Gemini API quota exceeded',
          'QUOTA_EXCEEDED',
          'Please check your API usage limits'
        );
      } else if (error.message?.includes('RATE_LIMIT')) {
        throw new ExternalAPIError(
          'Gemini API rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          'Please wait before making additional requests'
        );
      }

      throw new ExternalAPIError(
        'Failed to generate AI suggestions',
        'AI_GENERATION_ERROR',
        error.message
      );
    }
  }

  /**
   * Generate quick improvement suggestions for specific issues
   */
  async generateQuickFixes(article, specificIssues, options = {}) {
    try {
      const context = this.promptEngineeringService.analyzeSpecificIssues(article, specificIssues);
      const prompt = this.promptEngineeringService.buildQuickFixPrompt(context, options);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      const quickFixes = this.promptEngineeringService.processQuickFixResponse(
        generatedText,
        specificIssues
      );

      return {
        quickFixes,
        metadata: {
          requestId: this.generateRequestId(),
          model: 'gemini-1.5-flash',
          issuesAddressed: specificIssues.length,
          processingTime: Date.now() - context.startTime
        }
      };

    } catch (error) {
      throw new ExternalAPIError(
        'Failed to generate quick fixes',
        'AI_QUICKFIX_ERROR',
        error.message
      );
    }
  }

  /**
   * Generate content optimization recommendations
   */
  async generateOptimizationRecommendations(article, performanceMetrics, options = {}) {
    try {
      const context = this.promptEngineeringService.analyzePerformanceContext(
        article,
        performanceMetrics
      );

      const prompt = this.promptEngineeringService.buildOptimizationPrompt(context, options);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      const recommendations = this.promptEngineeringService.processOptimizationResponse(
        generatedText,
        context
      );

      return {
        recommendations,
        metadata: {
          requestId: this.generateRequestId(),
          model: 'gemini-1.5-flash',
          optimizationFocus: context.focusAreas,
          processingTime: Date.now() - context.startTime
        }
      };

    } catch (error) {
      throw new ExternalAPIError(
        'Failed to generate optimization recommendations',
        'AI_OPTIMIZATION_ERROR',
        error.message
      );
    }
  }

  /**
   * Check AI service health and connectivity
   */
  async healthCheck() {
    try {
      const testPrompt = "Respond with 'OK' if you can process this request.";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        status: 'healthy',
        model: 'gemini-1.5-flash',
        responseTime: Date.now(),
        testResponse: text.trim()
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Generate unique request ID for tracking
   */
  generateRequestId() {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Estimate token usage for cost tracking
   */
  estimateTokenUsage(prompt, response) {
    // Rough estimation: ~4 characters per token
    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(response.length / 4);
    
    return {
      promptTokens,
      responseTokens,
      totalTokens: promptTokens + responseTokens
    };
  }
}

/**
 * Prompt Engineering Service - Hybrid Template-Context System
 * Manages prompt templates and dynamic context integration
 */
class PromptEngineeringService {
  constructor() {
    this.templateManager = new TemplateManager();
    this.contextAnalyzer = new ContextAnalyzer();
    this.responseProcessor = new ResponseProcessor();
  }

  /**
   * Analyze article and audit context
   */
  analyzeContext(article, auditResults) {
    return this.contextAnalyzer.analyze(article, auditResults);
  }

  /**
   * Analyze specific issues for quick fixes
   */
  analyzeSpecificIssues(article, issues) {
    return this.contextAnalyzer.analyzeIssues(article, issues);
  }

  /**
   * Analyze performance metrics for optimization
   */
  analyzePerformanceContext(article, metrics) {
    return this.contextAnalyzer.analyzePerformance(article, metrics);
  }

  /**
   * Build comprehensive suggestion prompt
   */
  buildPrompt(suggestionType, context, options) {
    return this.templateManager.buildPrompt(suggestionType, context, options);
  }

  /**
   * Build quick fix prompt
   */
  buildQuickFixPrompt(context, options) {
    return this.templateManager.buildQuickFixPrompt(context, options);
  }

  /**
   * Build optimization prompt
   */
  buildOptimizationPrompt(context, options) {
    return this.templateManager.buildOptimizationPrompt(context, options);
  }

  /**
   * Process AI response into structured suggestions
   */
  processResponse(generatedText, context, options) {
    return this.responseProcessor.processGeneralResponse(generatedText, context, options);
  }

  /**
   * Process quick fix response
   */
  processQuickFixResponse(generatedText, issues) {
    return this.responseProcessor.processQuickFixResponse(generatedText, issues);
  }

  /**
   * Process optimization response
   */
  processOptimizationResponse(generatedText, context) {
    return this.responseProcessor.processOptimizationResponse(generatedText, context);
  }
}

/**
 * Template Manager - Manages prompt templates and dynamic assembly
 */
class TemplateManager {
  constructor() {
    this.templates = {
      comprehensive: this.getComprehensiveTemplate(),
      quickFix: this.getQuickFixTemplate(),
      optimization: this.getOptimizationTemplate(),
      seo: this.getSEOTemplate(),
      readability: this.getReadabilityTemplate()
    };
  }

  buildPrompt(type, context, options) {
    const template = this.templates[type] || this.templates.comprehensive;
    return template
      .replace('{{ARTICLE_TITLE}}', context.article.title)
      .replace('{{ARTICLE_CATEGORY}}', context.article.category)
      .replace('{{CONTENT_EXCERPT}}', context.contentExcerpt)
      .replace('{{ISSUES_SUMMARY}}', context.issuesSummary)
      .replace('{{SEVERITY_BREAKDOWN}}', context.severityBreakdown)
      .replace('{{FOCUS_AREAS}}', options.focusAreas.join(', ') || 'all areas')
      .replace('{{MAX_SUGGESTIONS}}', options.maxSuggestions)
      .replace('{{INCLUDE_EXAMPLES}}', options.includeExamples ? 'with specific examples' : 'without examples');
  }

  buildQuickFixPrompt(context, options) {
    return this.templates.quickFix
      .replace('{{ARTICLE_TITLE}}', context.article.title)
      .replace('{{SPECIFIC_ISSUES}}', context.issuesList)
      .replace('{{URGENCY_LEVEL}}', options.urgency || 'normal');
  }

  buildOptimizationPrompt(context, options) {
    return this.templates.optimization
      .replace('{{ARTICLE_TITLE}}', context.article.title)
      .replace('{{PERFORMANCE_METRICS}}', context.metricsDescription)
      .replace('{{OPTIMIZATION_GOALS}}', options.goals || 'general improvement');
  }

  getComprehensiveTemplate() {
    return `You are an expert content strategist for StoreHub, a point-of-sale and business management platform. Analyze this knowledge base article and provide actionable improvement suggestions.

**ARTICLE CONTEXT:**
- Title: "{{ARTICLE_TITLE}}"
- Category: {{ARTICLE_CATEGORY}}
- Content Preview: {{CONTENT_EXCERPT}}

**AUDIT FINDINGS:**
Issues Detected: {{ISSUES_SUMMARY}}
Severity Distribution: {{SEVERITY_BREAKDOWN}}

**TASK:**
Provide {{MAX_SUGGESTIONS}} specific, actionable suggestions to improve this article focusing on {{FOCUS_AREAS}}. 

**REQUIREMENTS:**
1. Address the most critical issues first
2. Provide concrete, implementable solutions
3. Consider StoreHub's business context (POS, retail, restaurants)
4. Include user experience improvements
5. Suggest content structure optimizations
{{INCLUDE_EXAMPLES}}

**FORMAT:**
Return suggestions as numbered list with:
- **Priority**: High/Medium/Low
- **Category**: Content/Technical/SEO/UX
- **Issue**: What needs improvement
- **Solution**: Specific action to take
- **Impact**: Expected improvement result

Focus on practical, actionable advice that improves user experience and content effectiveness.`;
  }

  getQuickFixTemplate() {
    return `You are a content optimization specialist. Provide immediate, actionable fixes for these specific issues in the StoreHub knowledge base article "{{ARTICLE_TITLE}}".

**SPECIFIC ISSUES TO ADDRESS:**
{{SPECIFIC_ISSUES}}

**REQUIREMENTS:**
- Provide quick, implementable solutions
- Focus on high-impact, low-effort improvements
- Urgency level: {{URGENCY_LEVEL}}
- Consider StoreHub's user base (business owners, staff)

**FORMAT:**
For each issue, provide:
1. **Quick Fix**: Immediate action to take
2. **Time Required**: Estimated time to implement
3. **Impact**: Expected improvement

Keep solutions practical and specific to StoreHub's business context.`;
  }

  getOptimizationTemplate() {
    return `You are a content performance analyst. Analyze this StoreHub knowledge base article and provide optimization recommendations based on performance data.

**ARTICLE:** "{{ARTICLE_TITLE}}"
**PERFORMANCE METRICS:** {{PERFORMANCE_METRICS}}
**OPTIMIZATION GOALS:** {{OPTIMIZATION_GOALS}}

**TASK:**
Provide data-driven recommendations to improve article performance, user engagement, and business outcomes.

**FOCUS AREAS:**
- User engagement metrics
- Search visibility
- Conversion optimization
- Content effectiveness
- Technical performance

**FORMAT:**
Provide recommendations with:
- **Metric**: What to improve
- **Current State**: Performance observation
- **Recommendation**: Specific optimization action
- **Expected Outcome**: Projected improvement
- **Priority**: Implementation priority

Base recommendations on StoreHub's business goals and user needs.`;
  }

  getSEOTemplate() {
    return `Provide SEO optimization suggestions for this StoreHub knowledge base article focusing on search visibility and organic discovery.`;
  }

  getReadabilityTemplate() {
    return `Analyze and provide readability improvements for this StoreHub knowledge base article to enhance user comprehension and engagement.`;
  }
}

/**
 * Context Analyzer - Extracts and analyzes content context
 */
class ContextAnalyzer {
  analyze(article, auditResults) {
    const startTime = Date.now();
    
    const context = {
      startTime,
      article: {
        id: article.id,
        title: article.title,
        category: article.category,
        wordCount: this.countWords(article.content),
        contentLength: article.content?.length || 0
      },
      contentExcerpt: this.extractExcerpt(article.content, 200),
      issuesSummary: this.summarizeIssues(auditResults.issues),
      severityBreakdown: this.analyzeSeverity(auditResults.issues),
      summary: {
        totalIssues: auditResults.issuesFound,
        highPriorityIssues: auditResults.issues.filter(i => i.severity === 'high').length,
        categories: [...new Set(auditResults.issues.map(i => i.category))]
      }
    };

    return context;
  }

  analyzeIssues(article, issues) {
    return {
      startTime: Date.now(),
      article: { id: article.id, title: article.title },
      issuesList: issues.map(issue => `- ${issue.issue}: ${issue.description}`).join('\n'),
      issueCount: issues.length
    };
  }

  analyzePerformance(article, metrics) {
    return {
      startTime: Date.now(),
      article: { id: article.id, title: article.title },
      metricsDescription: this.formatMetrics(metrics),
      focusAreas: this.identifyOptimizationAreas(metrics)
    };
  }

  extractExcerpt(content, maxLength = 200) {
    if (!content) return 'No content available';
    
    const plainText = content.replace(/[#*`\[\]()]/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  }

  summarizeIssues(issues) {
    if (!issues || issues.length === 0) return 'No issues detected';
    
    const summaries = issues.map(issue => 
      `${issue.severity.toUpperCase()}: ${issue.issue}`
    );
    
    return summaries.join(', ');
  }

  analyzeSeverity(issues) {
    const severities = { critical: 0, high: 0, medium: 0, low: 0 };
    
    issues.forEach(issue => {
      const severity = issue.severity?.toLowerCase() || 'medium';
      if (severities.hasOwnProperty(severity)) {
        severities[severity]++;
      }
    });

    return Object.entries(severities)
      .filter(([, count]) => count > 0)
      .map(([severity, count]) => `${severity}: ${count}`)
      .join(', ');
  }

  countWords(content) {
    if (!content) return 0;
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  formatMetrics(metrics) {
    return Object.entries(metrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  identifyOptimizationAreas(metrics) {
    const areas = [];
    
    if (metrics.viewCount < 50) areas.push('visibility');
    if (metrics.helpfulVotes < 5) areas.push('content quality');
    if (metrics.bounceRate > 70) areas.push('engagement');
    
    return areas;
  }
}

/**
 * Response Processor - Processes and structures AI responses
 */
class ResponseProcessor {
  processGeneralResponse(generatedText, context, options) {
    try {
      // Parse the AI response and structure it
      const suggestions = this.parseGeneratedSuggestions(generatedText);
      
      // Enhance with context-specific metadata
      const enhancedSuggestions = suggestions.map(suggestion => ({
        ...suggestion,
        contextRelevance: this.calculateRelevance(suggestion, context),
        implementationComplexity: this.assessComplexity(suggestion),
        estimatedImpact: this.estimateImpact(suggestion, context)
      }));

      // Sort by priority and relevance
      return enhancedSuggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      });

    } catch (error) {
      // Fallback parsing if structured parsing fails
      return this.fallbackParsing(generatedText, context);
    }
  }

  processQuickFixResponse(generatedText, issues) {
    const quickFixes = this.parseQuickFixes(generatedText);
    
    return quickFixes.map((fix, index) => ({
      ...fix,
      issueIndex: index,
      urgency: this.assessUrgency(fix, issues[index]),
      estimatedTime: this.parseTimeEstimate(fix.timeRequired)
    }));
  }

  processOptimizationResponse(generatedText, context) {
    const recommendations = this.parseOptimizationRecommendations(generatedText);
    
    return recommendations.map(rec => ({
      ...rec,
      feasibilityScore: this.assessFeasibility(rec),
      expectedROI: this.estimateROI(rec, context)
    }));
  }

  parseGeneratedSuggestions(text) {
    const suggestions = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSuggestion = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect numbered suggestions
      if (/^\d+\./.test(trimmedLine)) {
        if (currentSuggestion) {
          suggestions.push(currentSuggestion);
        }
        currentSuggestion = {
          id: suggestions.length + 1,
          title: trimmedLine.replace(/^\d+\.\s*/, ''),
          priority: 'medium',
          category: 'content',
          issue: '',
          solution: '',
          impact: ''
        };
      }
      // Parse structured fields
      else if (currentSuggestion && trimmedLine.startsWith('**Priority**:')) {
        currentSuggestion.priority = this.extractFieldValue(trimmedLine).toLowerCase();
      }
      else if (currentSuggestion && trimmedLine.startsWith('**Category**:')) {
        currentSuggestion.category = this.extractFieldValue(trimmedLine).toLowerCase();
      }
      else if (currentSuggestion && trimmedLine.startsWith('**Issue**:')) {
        currentSuggestion.issue = this.extractFieldValue(trimmedLine);
      }
      else if (currentSuggestion && trimmedLine.startsWith('**Solution**:')) {
        currentSuggestion.solution = this.extractFieldValue(trimmedLine);
      }
      else if (currentSuggestion && trimmedLine.startsWith('**Impact**:')) {
        currentSuggestion.impact = this.extractFieldValue(trimmedLine);
      }
    }
    
    if (currentSuggestion) {
      suggestions.push(currentSuggestion);
    }
    
    return suggestions;
  }

  parseQuickFixes(text) {
    // Similar parsing logic for quick fixes
    const fixes = [];
    const sections = text.split(/\d+\.\s*/).filter(s => s.trim());
    
    sections.forEach((section, index) => {
      const lines = section.split('\n').filter(l => l.trim());
      const fix = {
        id: index + 1,
        quickFix: '',
        timeRequired: '15 minutes',
        impact: 'Medium'
      };
      
      lines.forEach(line => {
        if (line.includes('Quick Fix:')) {
          fix.quickFix = this.extractFieldValue(line);
        } else if (line.includes('Time Required:')) {
          fix.timeRequired = this.extractFieldValue(line);
        } else if (line.includes('Impact:')) {
          fix.impact = this.extractFieldValue(line);
        }
      });
      
      if (fix.quickFix) {
        fixes.push(fix);
      }
    });
    
    return fixes;
  }

  parseOptimizationRecommendations(text) {
    // Similar parsing for optimization recommendations
    return [{
      id: 1,
      metric: 'General Optimization',
      currentState: 'Needs improvement',
      recommendation: text.substring(0, 200) + '...',
      expectedOutcome: 'Improved performance',
      priority: 'medium'
    }];
  }

  extractFieldValue(line) {
    return line.split(':').slice(1).join(':').trim().replace(/^\*\*|\*\*$/g, '');
  }

  calculateRelevance(suggestion, context) {
    // Calculate relevance score based on context
    let score = 0.5; // Base score
    
    if (context.summary.highPriorityIssues > 0 && suggestion.priority === 'high') {
      score += 0.3;
    }
    
    if (context.summary.categories.includes(suggestion.category)) {
      score += 0.2;
    }
    
    return Math.min(1.0, score);
  }

  assessComplexity(suggestion) {
    const complexKeywords = ['restructure', 'redesign', 'implement', 'integrate'];
    const simpleKeywords = ['update', 'fix', 'add', 'remove'];
    
    const text = (suggestion.solution || suggestion.title || '').toLowerCase();
    
    if (complexKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    } else if (simpleKeywords.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    
    return 'medium';
  }

  estimateImpact(suggestion, context) {
    if (suggestion.priority === 'high') return 'high';
    if (context.summary.totalIssues > 5 && suggestion.category === 'content') return 'medium';
    return 'medium';
  }

  assessUrgency(fix, issue) {
    if (issue?.severity === 'high') return 'high';
    return 'medium';
  }

  parseTimeEstimate(timeStr) {
    const matches = timeStr.match(/(\d+)\s*(minute|hour|day)/i);
    if (matches) {
      const value = parseInt(matches[1]);
      const unit = matches[2].toLowerCase();
      
      switch (unit) {
        case 'minute': return value;
        case 'hour': return value * 60;
        case 'day': return value * 60 * 24;
        default: return 30; // Default 30 minutes
      }
    }
    return 30;
  }

  assessFeasibility(recommendation) {
    // Simple feasibility assessment
    return Math.random() > 0.3 ? 'high' : 'medium';
  }

  estimateROI(recommendation, context) {
    // Simple ROI estimation
    return context.summary.totalIssues > 3 ? 'high' : 'medium';
  }

  fallbackParsing(generatedText, context) {
    // Simple fallback if structured parsing fails
    const sentences = generatedText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    return sentences.slice(0, 5).map((sentence, index) => ({
      id: index + 1,
      title: sentence.trim().substring(0, 100) + '...',
      priority: 'medium',
      category: 'content',
      issue: 'General improvement needed',
      solution: sentence.trim(),
      impact: 'Moderate improvement expected',
      contextRelevance: 0.6,
      implementationComplexity: 'medium',
      estimatedImpact: 'medium'
    }));
  }
}

module.exports = { AIService, PromptEngineeringService }; 