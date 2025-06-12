const BaseRule = require('./BaseRule');

/**
 * Duplicate Content Rule - Detects similar or repeated content sections
 * Analyzes content for repetitive text, similar headers, and redundant information
 */
class DuplicateContentRule extends BaseRule {
  constructor() {
    super({
      id: 'duplicate-content',
      name: 'Duplicate Content Detection',
      description: 'Identifies repeated content sections, similar text blocks, and redundant information',
      category: 'content-quality',
      severity: 'medium',
      version: '1.0.0',
      author: 'StoreHub Team',
      tags: ['duplicate', 'repetition', 'redundancy', 'content'],
      configurable: true,
      ruleConfig: {
        minSimilarityThreshold: 0.8, // 80% similarity threshold
        minTextLength: 50, // Minimum text length to check for duplicates
        checkHeaders: true,
        checkParagraphs: true,
        checkSentences: true,
        ignoreCommonPhrases: true,
        commonPhrases: [
          'thank you', 'please note', 'for more information',
          'if you have questions', 'contact support', 'getting started'
        ]
      }
    });
  }

  async execute(context) {
    const { article } = context;
    
    if (!article.content || article.content.length < 100) {
      return null; // Too short to meaningfully check for duplicates
    }

    const issues = [];

    // Check for duplicate headers
    if (this.config.checkHeaders) {
      const headerIssue = this.checkDuplicateHeaders(article.content);
      if (headerIssue) {
        issues.push(headerIssue);
      }
    }

    // Check for duplicate paragraphs
    if (this.config.checkParagraphs) {
      const paragraphIssues = this.checkDuplicateParagraphs(article.content);
      issues.push(...paragraphIssues);
    }

    // Check for duplicate sentences
    if (this.config.checkSentences) {
      const sentenceIssues = this.checkDuplicateSentences(article.content);
      issues.push(...sentenceIssues);
    }

    // Check for repetitive patterns
    const patternIssues = this.checkRepetitivePatterns(article.content);
    issues.push(...patternIssues);

    return issues.length > 0 ? this.consolidateDuplicateIssues(issues) : null;
  }

  checkDuplicateHeaders(content) {
    const headers = content.match(/^#+\s+(.+)$/gm) || [];
    if (headers.length < 2) return null;

    const headerTexts = headers.map(h => h.replace(/^#+\s+/, '').toLowerCase().trim());
    const duplicates = this.findDuplicates(headerTexts);

    if (duplicates.length > 0) {
      return this.createIssue(
        'Duplicate headers detected',
        `Found ${duplicates.length} headers that are identical or very similar.`,
        [
          'Review header names for uniqueness',
          'Use more specific header text',
          'Combine sections with similar headers',
          'Create a clear content hierarchy'
        ],
        {
          duplicateHeaders: duplicates.slice(0, 3),
          severity: 'medium'
        }
      );
    }

    return null;
  }

  checkDuplicateParagraphs(content) {
    const issues = [];
    
    // Split into paragraphs (double newline separated)
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > this.config.minTextLength);

    if (paragraphs.length < 2) return issues;

    const similarities = this.findSimilarTexts(paragraphs);
    
    if (similarities.length > 0) {
      issues.push(this.createIssue(
        'Similar paragraphs detected',
        `Found ${similarities.length} pairs of paragraphs with high similarity.`,
        [
          'Review similar paragraphs for redundancy',
          'Combine or consolidate repetitive content',
          'Ensure each paragraph adds unique value',
          'Consider creating reusable content blocks'
        ],
        {
          similarParagraphs: similarities.slice(0, 2).map(s => ({
            similarity: Math.round(s.similarity * 100),
            text1: s.text1.substring(0, 100) + '...',
            text2: s.text2.substring(0, 100) + '...'
          })),
          severity: 'medium'
        }
      ));
    }

    return issues;
  }

  checkDuplicateSentences(content) {
    const issues = [];
    
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Only check substantial sentences

    if (sentences.length < 2) return issues;

    const duplicates = this.findExactDuplicates(sentences);
    
    if (duplicates.length > 0) {
      issues.push(this.createIssue(
        'Duplicate sentences found',
        `Found ${duplicates.length} sentences that are repeated exactly.`,
        [
          'Remove duplicate sentences',
          'Vary sentence structure when conveying similar information',
          'Use references instead of repeating information',
          'Check for copy-paste errors'
        ],
        {
          duplicateSentences: duplicates.slice(0, 3).map(d => ({
            sentence: d.text.substring(0, 80) + '...',
            occurrences: d.count
          })),
          severity: 'high'
        }
      ));
    }

    return issues;
  }

  checkRepetitivePatterns(content) {
    const issues = [];
    
    // Check for repeated phrases (3+ words)
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const phrases = [];
    
    // Create 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = words.slice(i, i + 3).join(' ');
      if (phrase.length > 10) { // Only meaningful phrases
        phrases.push(phrase);
      }
    }

    const repeatedPhrases = this.findFrequentItems(phrases, 3); // 3+ occurrences
    
    // Filter out common phrases if configured
    const filteredPhrases = this.config.ignoreCommonPhrases
      ? repeatedPhrases.filter(p => !this.isCommonPhrase(p.item))
      : repeatedPhrases;

    if (filteredPhrases.length > 0) {
      issues.push(this.createIssue(
        'Repetitive phrases detected',
        `Found ${filteredPhrases.length} phrases that are repeated frequently.`,
        [
          'Vary language to avoid repetitive phrasing',
          'Use synonyms and alternative expressions',
          'Review content for necessary repetition',
          'Consider creating a glossary for repeated terms'
        ],
        {
          repetitivePhrases: filteredPhrases.slice(0, 3).map(p => ({
            phrase: p.item,
            occurrences: p.count
          })),
          severity: 'low'
        }
      ));
    }

    return issues;
  }

  findDuplicates(items) {
    const counts = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([item, count]) => count > 1)
      .map(([item, count]) => ({ text: item, count }));
  }

  findExactDuplicates(sentences) {
    const normalized = sentences.map(s => 
      s.toLowerCase().replace(/[^\w\s]/g, '').trim()
    );
    
    return this.findDuplicates(normalized)
      .filter(d => d.text.length > 20); // Only substantial duplicates
  }

  findSimilarTexts(texts) {
    const similarities = [];
    
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const similarity = this.calculateTextSimilarity(texts[i], texts[j]);
        if (similarity >= this.config.minSimilarityThreshold) {
          similarities.push({
            text1: texts[i],
            text2: texts[j],
            similarity
          });
        }
      }
    }
    
    return similarities;
  }

  calculateTextSimilarity(text1, text2) {
    // Simple similarity based on common words
    const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  findFrequentItems(items, minCount) {
    const counts = {};
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([item, count]) => count >= minCount)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count);
  }

  isCommonPhrase(phrase) {
    return this.config.commonPhrases.some(common => 
      phrase.includes(common.toLowerCase())
    );
  }

  consolidateDuplicateIssues(issues) {
    // Sort by severity and impact
    const severityOrder = { high: 3, medium: 2, low: 1 };
    
    issues.sort((a, b) => {
      const aSeverity = severityOrder[a.metadata?.severity || 'medium'];
      const bSeverity = severityOrder[b.metadata?.severity || 'medium'];
      return bSeverity - aSeverity;
    });

    const primaryIssue = issues[0];
    
    // Combine suggestions
    const allSuggestions = issues.flatMap(issue => issue.suggestions);
    const uniqueSuggestions = [...new Set(allSuggestions)];
    
    return {
      ...primaryIssue,
      suggestions: uniqueSuggestions.slice(0, 6),
      metadata: {
        ...primaryIssue.metadata,
        totalDuplicateIssues: issues.length,
        allIssueTypes: issues.map(i => i.issue)
      }
    };
  }

  validateConfig(config) {
    return (
      config.minSimilarityThreshold > 0 &&
      config.minSimilarityThreshold <= 1 &&
      config.minTextLength > 0 &&
      Array.isArray(config.commonPhrases)
    );
  }
}

module.exports = DuplicateContentRule; 