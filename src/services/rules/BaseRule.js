/**
 * Base Rule Class - Abstract base for all content audit rules
 * Provides common functionality and enforces rule contract
 */
class BaseRule {
  constructor(config = {}) {
    this.id = config.id || this.constructor.name.toLowerCase();
    this.name = config.name || this.constructor.name;
    this.description = config.description || 'No description provided';
    this.category = config.category || 'general';
    this.severity = config.severity || 'medium';
    this.enabled = config.enabled !== false;
    this.version = config.version || '1.0.0';
    this.author = config.author || 'System';
    this.tags = config.tags || [];
    this.dependencies = config.dependencies || [];
    this.configurable = config.configurable || false;
    this.config = config.ruleConfig || {};
  }

  /**
   * Execute the rule against an article context
   * Must be implemented by subclasses
   */
  async execute(context) {
    throw new Error(`Rule ${this.id} must implement execute method`);
  }

  /**
   * Update rule configuration
   */
  updateConfig(newConfig) {
    if (this.configurable) {
      this.config = { ...this.config, ...newConfig };
      return true;
    }
    return false;
  }

  /**
   * Validate rule configuration
   */
  validateConfig(config) {
    // Override in subclasses for specific validation
    return true;
  }

  /**
   * Get rule metadata
   */
  getMetadata() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      severity: this.severity,
      enabled: this.enabled,
      version: this.version,
      author: this.author,
      tags: this.tags,
      dependencies: this.dependencies,
      configurable: this.configurable,
      config: this.config
    };
  }

  /**
   * Create a standardized issue response
   */
  createIssue(issue, description, suggestions = [], metadata = {}) {
    return {
      issue,
      description,
      suggestions,
      metadata: {
        ...metadata,
        detectedAt: new Date().toISOString(),
        ruleVersion: this.version
      }
    };
  }

  /**
   * Helper method to check if content is outdated based on date
   */
  isContentOutdated(lastModified, thresholdDays = 365) {
    const now = new Date();
    const modified = new Date(lastModified);
    const diffTime = Math.abs(now - modified);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > thresholdDays;
  }

  /**
   * Helper method to extract URLs from content
   */
  extractUrls(content) {
    if (!content) return [];
    
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = [];
    let match;
    
    while ((match = urlRegex.exec(content)) !== null) {
      urls.push(match[0]);
    }
    
    return urls;
  }

  /**
   * Helper method to check readability metrics
   */
  calculateReadabilityScore(content) {
    if (!content) return 0;
    
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);
    
    // Simplified Flesch Reading Ease score
    if (sentences === 0 || words === 0) return 0;
    
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;
    
    return 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  }

  /**
   * Helper method to count syllables in text
   */
  countSyllables(text) {
    if (!text) return 0;
    
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let totalSyllables = 0;
    
    for (const word of words) {
      let syllables = word.match(/[aeiouy]+/g) || [];
      syllables = syllables.length;
      
      // Handle silent 'e'
      if (word.endsWith('e') && syllables > 1) {
        syllables--;
      }
      
      // Minimum of 1 syllable per word
      totalSyllables += Math.max(1, syllables);
    }
    
    return totalSyllables;
  }

  /**
   * Helper method to check for common spelling/grammar issues
   */
  checkBasicGrammar(content) {
    if (!content) return [];
    
    const issues = [];
    
    // Check for double spaces
    if (content.includes('  ')) {
      issues.push('Multiple consecutive spaces found');
    }
    
    // Check for missing punctuation at end of sentences
    const sentences = content.split(/[.!?]+/);
    if (sentences.length > 1 && !content.trim().match(/[.!?]$/)) {
      issues.push('Content may be missing punctuation at the end');
    }
    
    // Check for inconsistent capitalization in headers
    const headers = content.match(/^#+\s+(.+)$/gm) || [];
    for (const header of headers) {
      const title = header.replace(/^#+\s+/, '');
      if (title.toLowerCase() === title && title.length > 3) {
        issues.push(`Header "${title}" may need proper capitalization`);
      }
    }
    
    return issues;
  }
}

module.exports = BaseRule; 