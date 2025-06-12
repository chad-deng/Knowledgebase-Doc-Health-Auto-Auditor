const stringSimilarity = require('string-similarity');
const natural = require('natural');
const compromise = require('compromise');
const { RulesEngine } = require('./rulesEngine');
const { ServiceError } = require('../middleware/errorHandling/errors');

/**
 * Advanced Rules Engine - Enhanced Content Analysis
 * Builds upon the base RulesEngine with AI-powered and NLP-enhanced capabilities
 */
class AdvancedRulesEngine extends RulesEngine {
  constructor() {
    super();
    this.similarityThreshold = 0.7; // Configurable similarity threshold
    this.stemmer = natural.PorterStemmer;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    
    // Content similarity cache for performance
    this.similarityCache = new Map();
    this.structuralAnalysisCache = new Map();
    
    // Initialize advanced analysis modules
    this.initializeAdvancedModules();
  }

  /**
   * Initialize advanced analysis modules
   */
  initializeAdvancedModules() {
    this.contentSimilarityAnalyzer = new ContentSimilarityAnalyzer(this.similarityThreshold);
    this.structuralAnalyzer = new StructuralAnalyzer();
    this.semanticAnalyzer = new SemanticAnalyzer();
  }

  /**
   * Enhanced article analysis with advanced content detection
   */
  async analyzeArticleAdvanced(article, compareAgainst = []) {
    try {
      const startTime = Date.now();
      const basicAnalysis = await this.executeRules(article);
      
      // Advanced analysis results
      const advancedResults = {
        ...basicAnalysis,
        advancedAnalysis: {
          contentSimilarity: await this.analyzeContentSimilarity(article, compareAgainst),
          structuralAnalysis: await this.analyzeStructuralIssues(article),
          semanticAnalysis: await this.analyzeSemanticContent(article),
          duplicateDetection: await this.enhancedDuplicateDetection(article, compareAgainst),
          readabilityAnalysis: await this.analyzeReadability(article)
        },
        analysisMetadata: {
          analysisType: 'advanced',
          processingTime: Date.now() - startTime,
          confidenceScore: this.calculateConfidenceScore(basicAnalysis),
          cacheHits: {
            similarity: this.similarityCache.size,
            structural: this.structuralAnalysisCache.size
          }
        }
      };

      return advancedResults;
    } catch (error) {
      throw ServiceError.rules('analyzeArticleAdvanced', 'Advanced analysis failed', error);
    }
  }

  /**
   * Analyze content similarity against other articles
   */
  async analyzeContentSimilarity(article, compareAgainst) {
    try {
      const similarities = [];
      const articleContent = this.preprocessContentForSimilarity(article.content);
      
      for (const compareArticle of compareAgainst) {
        if (compareArticle.id === article.id) continue;
        
        const compareContent = this.preprocessContentForSimilarity(compareArticle.content);
        
        // Multiple similarity metrics
        const metrics = {
          jaccardSimilarity: this.calculateJaccardSimilarity(articleContent, compareContent),
          cosineSimilarity: this.calculateCosineSimilarity(articleContent, compareContent),
          semanticSimilarity: await this.calculateSemanticSimilarity(articleContent, compareContent),
          structuralSimilarity: this.calculateStructuralSimilarity(article, compareArticle)
        };

        const overallSimilarity = this.weightedSimilarityScore(metrics);
        
        if (overallSimilarity > this.similarityThreshold) {
          similarities.push({
            articleId: compareArticle.id,
            title: compareArticle.title,
            similarityScore: overallSimilarity,
            metrics,
            recommendations: this.generateSimilarityRecommendations(overallSimilarity, metrics)
          });
        }
      }

      return {
        similarArticlesFound: similarities.length,
        similarities: similarities.sort((a, b) => b.similarityScore - a.similarityScore),
        analysisConfig: {
          threshold: this.similarityThreshold,
          metricsUsed: ['jaccard', 'cosine', 'semantic', 'structural']
        }
      };
    } catch (error) {
      throw ServiceError.rules('analyzeContentSimilarity', 'Content similarity analysis failed', error);
    }
  }

  /**
   * Analyze structural issues in content
   */
  async analyzeStructuralIssues(article) {
    try {
      const cacheKey = `structural_${article.id}`;
      if (this.structuralAnalysisCache.has(cacheKey)) {
        return this.structuralAnalysisCache.get(cacheKey);
      }

      const analysis = await this.structuralAnalyzer.analyze(article);
      this.structuralAnalysisCache.set(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      throw ServiceError.rules('analyzeStructuralIssues', 'Structural analysis failed', error);
    }
  }

  /**
   * Analyze semantic content using NLP
   */
  async analyzeSemanticContent(article) {
    try {
      return await this.semanticAnalyzer.analyze(article);
    } catch (error) {
      return {
        error: 'Semantic analysis failed',
        fallback: true,
        basicMetrics: {
          wordCount: article.content.replace(/<[^>]*>/g, '').split(/\s+/).length,
          characterCount: article.content.length
        }
      };
    }
  }

  /**
   * Enhanced duplicate detection with semantic analysis
   */
  async enhancedDuplicateDetection(article, articles) {
    try {
      const potentialDuplicates = [];
      
      for (const compareArticle of articles) {
        if (compareArticle.id === article.id) continue;
        
        const duplicateAnalysis = {
          titleSimilarity: stringSimilarity.compareTwoStrings(article.title, compareArticle.title),
          contentSimilarity: await this.calculateAdvancedContentSimilarity(article.content, compareArticle.content),
          topicSimilarity: await this.calculateTopicSimilarity(article, compareArticle),
          structuralSimilarity: this.calculateStructuralSimilarity(article, compareArticle)
        };

        const duplicateScore = this.calculateDuplicateScore(duplicateAnalysis);
        
        if (duplicateScore > 0.8) {
          potentialDuplicates.push({
            articleId: compareArticle.id,
            title: compareArticle.title,
            duplicateScore,
            analysis: duplicateAnalysis,
            recommendation: this.getDuplicateRecommendation(duplicateScore, duplicateAnalysis)
          });
        }
      }

      return {
        potentialDuplicatesFound: potentialDuplicates.length,
        duplicates: potentialDuplicates.sort((a, b) => b.duplicateScore - a.duplicateScore),
        consolidationOpportunities: this.identifyConsolidationOpportunities(potentialDuplicates)
      };
    } catch (error) {
      throw ServiceError.rules('enhancedDuplicateDetection', 'Enhanced duplicate detection failed', error);
    }
  }

  /**
   * Analyze readability metrics
   */
  async analyzeReadability(article) {
    try {
      return await this.semanticAnalyzer.calculateReadabilityScore(article.content);
    } catch (error) {
      return {
        error: 'Readability analysis failed',
        score: 50, // Default neutral score
        level: 'Unknown'
      };
    }
  }

  /**
   * Preprocess content for similarity analysis
   */
  preprocessContentForSimilarity(content) {
    // Remove HTML tags, normalize whitespace, convert to lowercase
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();
    
    // Tokenize and stem words
    const tokens = this.tokenizer.tokenize(cleanContent);
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    return {
      raw: cleanContent,
      tokens: tokens,
      stemmed: stemmedTokens,
      sentences: this.sentenceTokenizer.tokenize(cleanContent)
    };
  }

  /**
   * Calculate Jaccard similarity coefficient
   */
  calculateJaccardSimilarity(content1, content2) {
    const set1 = new Set(content1.stemmed);
    const set2 = new Set(content2.stemmed);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate cosine similarity
   */
  calculateCosineSimilarity(content1, content2) {
    const allWords = [...new Set([...content1.tokens, ...content2.tokens])];
    
    const vector1 = allWords.map(word => content1.tokens.filter(t => t === word).length);
    const vector2 = allWords.map(word => content2.tokens.filter(t => t === word).length);
    
    // Calculate cosine similarity
    const dotProduct = vector1.reduce((sum, a, idx) => sum + (a * vector2[idx]), 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + (a * a), 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + (a * a), 0));
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  /**
   * Calculate semantic similarity using compromise NLP
   */
  async calculateSemanticSimilarity(content1, content2) {
    try {
      // Extract key concepts and topics
      const doc1 = compromise(content1.raw);
      const doc2 = compromise(content2.raw);
      
      const topics1 = doc1.topics().out('array');
      const topics2 = doc2.topics().out('array');
      
      const people1 = doc1.people().out('array');
      const people2 = doc2.people().out('array');
      
      const places1 = doc1.places().out('array');
      const places2 = doc2.places().out('array');
      
      // Calculate overlap in semantic elements
      const topicOverlap = this.calculateArrayOverlap(topics1, topics2);
      const peopleOverlap = this.calculateArrayOverlap(people1, people2);
      const placesOverlap = this.calculateArrayOverlap(places1, places2);
      
      return (topicOverlap + peopleOverlap + placesOverlap) / 3;
    } catch (error) {
      // Fallback to string similarity if NLP fails
      return stringSimilarity.compareTwoStrings(content1.raw, content2.raw);
    }
  }

  /**
   * Calculate overlap between two arrays
   */
  calculateArrayOverlap(arr1, arr2) {
    if (arr1.length === 0 && arr2.length === 0) return 1;
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate structural similarity between articles
   */
  calculateStructuralSimilarity(article1, article2) {
    // Compare structural elements
    const headings1 = (article1.content.match(/<h[1-6][^>]*>/gi) || []).length;
    const headings2 = (article2.content.match(/<h[1-6][^>]*>/gi) || []).length;
    
    const lists1 = (article1.content.match(/<(ul|ol)[^>]*>/gi) || []).length;
    const lists2 = (article2.content.match(/<(ul|ol)[^>]*>/gi) || []).length;
    
    const images1 = (article1.content.match(/<img[^>]*>/gi) || []).length;
    const images2 = (article2.content.match(/<img[^>]*>/gi) || []).length;
    
    // Simple structural similarity based on element counts
    const headingSimilarity = 1 - Math.abs(headings1 - headings2) / Math.max(headings1, headings2, 1);
    const listSimilarity = 1 - Math.abs(lists1 - lists2) / Math.max(lists1, lists2, 1);
    const imageSimilarity = 1 - Math.abs(images1 - images2) / Math.max(images1, images2, 1);
    
    return (headingSimilarity + listSimilarity + imageSimilarity) / 3;
  }

  /**
   * Calculate weighted similarity score
   */
  weightedSimilarityScore(metrics) {
    return (
      metrics.jaccardSimilarity * 0.3 +
      metrics.cosineSimilarity * 0.3 +
      metrics.semanticSimilarity * 0.3 +
      metrics.structuralSimilarity * 0.1
    );
  }

  /**
   * Calculate advanced content similarity
   */
  async calculateAdvancedContentSimilarity(content1, content2) {
    const processed1 = this.preprocessContentForSimilarity(content1);
    const processed2 = this.preprocessContentForSimilarity(content2);
    
    const jaccard = this.calculateJaccardSimilarity(processed1, processed2);
    const cosine = this.calculateCosineSimilarity(processed1, processed2);
    const semantic = await this.calculateSemanticSimilarity(processed1, processed2);
    
    return (jaccard + cosine + semantic) / 3;
  }

  /**
   * Calculate topic similarity
   */
  async calculateTopicSimilarity(article1, article2) {
    try {
      const doc1 = compromise(article1.content.replace(/<[^>]*>/g, ' '));
      const doc2 = compromise(article2.content.replace(/<[^>]*>/g, ' '));
      
      const topics1 = doc1.topics().out('array');
      const topics2 = doc2.topics().out('array');
      
      return this.calculateArrayOverlap(topics1, topics2);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate duplicate score
   */
  calculateDuplicateScore(analysis) {
    return (
      analysis.titleSimilarity * 0.3 +
      analysis.contentSimilarity * 0.4 +
      analysis.topicSimilarity * 0.2 +
      analysis.structuralSimilarity * 0.1
    );
  }

  /**
   * Get duplicate recommendation
   */
  getDuplicateRecommendation(score, analysis) {
    if (score > 0.95) {
      return {
        type: 'merge_immediate',
        priority: 'high',
        action: 'These articles are nearly identical and should be merged immediately',
        confidence: 0.95
      };
    } else if (score > 0.85) {
      return {
        type: 'review_merge',
        priority: 'medium',
        action: 'Review for potential merging - high content overlap detected',
        confidence: 0.8
      };
    } else {
      return {
        type: 'monitor',
        priority: 'low',
        action: 'Monitor for content drift - some similarity detected',
        confidence: 0.6
      };
    }
  }

  /**
   * Identify consolidation opportunities
   */
  identifyConsolidationOpportunities(duplicates) {
    const opportunities = [];
    
    // Group by similarity score ranges
    const highSimilarity = duplicates.filter(d => d.duplicateScore > 0.9);
    const mediumSimilarity = duplicates.filter(d => d.duplicateScore > 0.8 && d.duplicateScore <= 0.9);
    
    if (highSimilarity.length > 0) {
      opportunities.push({
        type: 'immediate_consolidation',
        articles: highSimilarity.map(d => d.articleId),
        priority: 'high',
        estimatedEffort: 'low',
        description: 'Near-duplicate articles that can be easily merged'
      });
    }
    
    if (mediumSimilarity.length > 0) {
      opportunities.push({
        type: 'review_consolidation',
        articles: mediumSimilarity.map(d => d.articleId),
        priority: 'medium',
        estimatedEffort: 'medium',
        description: 'Articles with significant overlap requiring review'
      });
    }
    
    return opportunities;
  }

  /**
   * Generate recommendations based on similarity analysis
   */
  generateSimilarityRecommendations(similarityScore, metrics) {
    const recommendations = [];
    
    if (similarityScore > 0.9) {
      recommendations.push({
        type: 'merge_candidates',
        priority: 'high',
        action: 'Consider merging these articles as they are nearly identical',
        confidence: 0.9
      });
    } else if (similarityScore > 0.7) {
      recommendations.push({
        type: 'review_overlap',
        priority: 'medium',
        action: 'Review articles for content overlap and potential consolidation',
        confidence: 0.8
      });
    }
    
    if (metrics.structuralSimilarity > 0.8) {
      recommendations.push({
        type: 'structural_standardization',
        priority: 'low',
        action: 'Consider standardizing structure across similar articles',
        confidence: 0.7
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate confidence score for analysis results
   */
  calculateConfidenceScore(analysisResults) {
    // Base confidence on number of rules executed and issues found
    const rulesExecuted = analysisResults.totalRulesExecuted || 0;
    const issuesFound = analysisResults.issuesFound || 0;
    
    // Higher confidence with more rules and balanced issue detection
    const rulesCoverage = Math.min(rulesExecuted / 5, 1); // Normalize to 5 rules
    const issueBalance = issuesFound > 0 ? Math.min(issuesFound / 10, 1) : 0.5;
    
    return (rulesCoverage * 0.7 + issueBalance * 0.3);
  }

  /**
   * Batch analyze multiple articles with advanced features
   */
  async batchAnalyzeAdvanced(articles, options = {}) {
    try {
      const results = [];
      const { enableSimilarity = true, enableStructural = true } = options;
      
      for (const article of articles) {
        const compareAgainst = enableSimilarity ? articles.filter(a => a.id !== article.id) : [];
        const analysis = await this.analyzeArticleAdvanced(article, compareAgainst);
        results.push(analysis);
      }

      return {
        totalArticles: articles.length,
        results,
        batchMetadata: {
          similarityEnabled: enableSimilarity,
          structuralEnabled: enableStructural,
          processingTime: results.reduce((sum, r) => sum + (r.analysisMetadata?.processingTime || 0), 0),
          averageConfidence: results.reduce((sum, r) => sum + (r.analysisMetadata?.confidenceScore || 0), 0) / results.length
        },
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      throw ServiceError.rules('batchAnalyzeAdvanced', 'Batch advanced analysis failed', error);
    }
  }
}

/**
 * Content Similarity Analyzer - Specialized class for content similarity detection
 */
class ContentSimilarityAnalyzer {
  constructor(threshold = 0.7) {
    this.threshold = threshold;
    this.cache = new Map();
  }

  async analyze(content1, content2) {
    const cacheKey = `${this.generateContentHash(content1)}_${this.generateContentHash(content2)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.performSimilarityAnalysis(content1, content2);
    this.cache.set(cacheKey, result);
    
    return result;
  }

  generateContentHash(content) {
    // Simple hash for caching purposes
    return content.substring(0, 50).replace(/\s+/g, '').toLowerCase();
  }

  async performSimilarityAnalysis(content1, content2) {
    // Implementation details for similarity analysis
    return {
      similarity: stringSimilarity.compareTwoStrings(content1, content2),
      analysis: 'detailed similarity analysis'
    };
  }
}

/**
 * Structural Analyzer - Analyzes document structure and formatting
 */
class StructuralAnalyzer {
  async analyze(article) {
    const structure = {
      headingHierarchy: this.analyzeHeadingHierarchy(article.content),
      listStructure: this.analyzeListStructure(article.content),
      paragraphStructure: this.analyzeParagraphStructure(article.content),
      linkDistribution: this.analyzeLinkDistribution(article.content),
      imageDistribution: this.analyzeImageDistribution(article.content)
    };

    return {
      ...structure,
      structuralScore: this.calculateStructuralScore(structure),
      recommendations: this.generateStructuralRecommendations(structure)
    };
  }

  analyzeHeadingHierarchy(content) {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, '').trim(),
        position: match.index
      });
    }

    return {
      headings,
      hierarchyIssues: this.findHierarchyIssues(headings),
      maxDepth: headings.length > 0 ? Math.max(...headings.map(h => h.level)) : 0,
      totalHeadings: headings.length
    };
  }

  findHierarchyIssues(headings) {
    const issues = [];
    
    for (let i = 1; i < headings.length; i++) {
      const current = headings[i];
      const previous = headings[i - 1];
      
      if (current.level > previous.level + 1) {
        issues.push({
          type: 'hierarchy_skip',
          position: current.position,
          description: `Heading level ${current.level} follows ${previous.level}, skipping intermediate levels`
        });
      }
    }
    
    return issues;
  }

  analyzeListStructure(content) {
    const listRegex = /<(ul|ol)[^>]*>[\s\S]*?<\/\1>/gi;
    const lists = [];
    let match;

    while ((match = listRegex.exec(content)) !== null) {
      const listType = match[1];
      const listContent = match[0];
      const items = (listContent.match(/<li[^>]*>[\s\S]*?<\/li>/gi) || []).length;
      
      lists.push({
        type: listType,
        itemCount: items,
        position: match.index,
        nested: (listContent.match(/<(ul|ol)/gi) || []).length > 1
      });
    }

    return {
      lists,
      totalLists: lists.length,
      averageItemsPerList: lists.length > 0 ? lists.reduce((sum, list) => sum + list.itemCount, 0) / lists.length : 0
    };
  }

  analyzeParagraphStructure(content) {
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/i).filter(p => p.trim().length > 0);
    const wordCounts = paragraphs.map(p => p.replace(/<[^>]*>/g, '').trim().split(/\s+/).length);
    
    return {
      totalParagraphs: paragraphs.length,
      averageWordsPerParagraph: wordCounts.length > 0 ? wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length : 0,
      shortParagraphs: wordCounts.filter(count => count < 20).length,
      longParagraphs: wordCounts.filter(count => count > 100).length
    };
  }

  analyzeLinkDistribution(content) {
    const linkRegex = /<a[^>]*href=[^>]*>[\s\S]*?<\/a>/gi;
    const links = content.match(linkRegex) || [];
    
    return {
      totalLinks: links.length,
      internalLinks: links.filter(link => !link.includes('http')).length,
      externalLinks: links.filter(link => link.includes('http')).length
    };
  }

  analyzeImageDistribution(content) {
    const imageRegex = /<img[^>]*>/gi;
    const images = content.match(imageRegex) || [];
    
    return {
      totalImages: images.length,
      imagesWithAlt: images.filter(img => img.includes('alt=')).length,
      imagesWithoutAlt: images.filter(img => !img.includes('alt=')).length
    };
  }

  calculateStructuralScore(structure) {
    let score = 100;
    
    // Deduct points for structural issues
    score -= structure.headingHierarchy.hierarchyIssues.length * 10;
    score -= structure.paragraphStructure.shortParagraphs * 2;
    score -= structure.paragraphStructure.longParagraphs * 3;
    score -= structure.imageDistribution.imagesWithoutAlt * 5;
    
    return Math.max(score, 0);
  }

  generateStructuralRecommendations(structure) {
    const recommendations = [];
    
    if (structure.headingHierarchy.hierarchyIssues.length > 0) {
      recommendations.push({
        type: 'heading_hierarchy',
        priority: 'medium',
        message: 'Fix heading hierarchy by ensuring proper level progression'
      });
    }
    
    if (structure.paragraphStructure.longParagraphs > 0) {
      recommendations.push({
        type: 'paragraph_length',
        priority: 'low',
        message: 'Consider breaking down long paragraphs for better readability'
      });
    }
    
    if (structure.imageDistribution.imagesWithoutAlt > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        message: 'Add alt text to images for better accessibility'
      });
    }
    
    return recommendations;
  }
}

/**
 * Semantic Analyzer - Analyzes content meaning and context
 */
class SemanticAnalyzer {
  async analyze(article) {
    try {
      const doc = compromise(article.content.replace(/<[^>]*>/g, ' '));
      
      return {
        topics: doc.topics().out('array'),
        people: doc.people().out('array'),
        places: doc.places().out('array'),
        organizations: doc.organizations().out('array'),
        sentiment: this.analyzeSentiment(doc),
        readabilityScore: this.calculateReadabilityScore(article.content),
        keyPhrases: this.extractKeyPhrases(doc)
      };
    } catch (error) {
      return {
        error: 'Semantic analysis failed',
        fallback: true
      };
    }
  }

  analyzeSentiment(doc) {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'helpful', 'useful'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'useless', 'difficult'];
    
    const text = doc.text().toLowerCase();
    const positive = positiveWords.reduce((count, word) => count + (text.split(word).length - 1), 0);
    const negative = negativeWords.reduce((count, word) => count + (text.split(word).length - 1), 0);
    
    return {
      positive,
      negative,
      neutral: positive === negative,
      score: (positive - negative) / (positive + negative + 1)
    };
  }

  calculateReadabilityScore(content) {
    const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = cleanText.split(/[.!?]+/).length;
    const words = cleanText.split(/\s+/).length;
    const syllables = this.countSyllables(cleanText);
    
    // Flesch Reading Ease Score
    const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    return {
      score: Math.max(0, Math.min(100, score)),
      level: this.getReadabilityLevel(score),
      metrics: { sentences, words, syllables }
    };
  }

  countSyllables(text) {
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiou]{2,}/g, 'a')
      .replace(/[^aeiou]/g, '')
      .length || 1;
  }

  getReadabilityLevel(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  extractKeyPhrases(doc) {
    // Extract important phrases and concepts
    return {
      noun_phrases: doc.match('#Noun+').out('array').slice(0, 10),
      verbs: doc.verbs().out('array').slice(0, 10),
      adjectives: doc.adjectives().out('array').slice(0, 10)
    };
  }
}

module.exports = AdvancedRulesEngine; 