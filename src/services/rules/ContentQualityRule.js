const BaseRule = require('./BaseRule');

/**
 * Content Quality Rule - Analyzes content for readability, structure, and quality
 * Checks grammar, readability scores, content length, and formatting
 */
class ContentQualityRule extends BaseRule {
  constructor() {
    super({
      id: 'content-quality',
      name: 'Content Quality Assessment',
      description: 'Evaluates content for readability, structure, grammar, and overall quality',
      category: 'content-quality',
      severity: 'medium',
      version: '1.1.0',
      author: 'StoreHub Team',
      tags: ['quality', 'readability', 'grammar', 'structure'],
      configurable: true,
      ruleConfig: {
        minWordCount: 50,
        maxWordCount: 5000,
        minReadabilityScore: 30, // Flesch Reading Ease
        maxReadabilityScore: 90,
        checkGrammar: true,
        checkStructure: true,
        checkFormatting: true,
        requireHeaders: true,
        minHeaderCount: 1,
        maxSentenceLength: 25 // words per sentence
      }
    });
  }

  async execute(context) {
    const issues = [];
    const { article, metadata } = context;

    // Check content length
    const lengthIssue = this.checkContentLength(metadata.wordCount);
    if (lengthIssue) {
      issues.push(lengthIssue);
    }

    // Check readability
    if (article.content) {
      const readabilityIssue = this.checkReadability(article.content);
      if (readabilityIssue) {
        issues.push(readabilityIssue);
      }

      // Check grammar and spelling
      if (this.config.checkGrammar) {
        const grammarIssues = this.checkGrammar(article.content);
        issues.push(...grammarIssues);
      }

      // Check content structure
      if (this.config.checkStructure) {
        const structureIssue = this.checkStructure(article.content);
        if (structureIssue) {
          issues.push(structureIssue);
        }
      }

      // Check formatting
      if (this.config.checkFormatting) {
        const formattingIssues = this.checkFormatting(article.content);
        issues.push(...formattingIssues);
      }
    }

    // Return the most significant issue
    return issues.length > 0 ? this.consolidateQualityIssues(issues, metadata) : null;
  }

  checkContentLength(wordCount) {
    if (wordCount < this.config.minWordCount) {
      return this.createIssue(
        'Content too short',
        `Article contains only ${wordCount} words, which may not provide sufficient detail.`,
        [
          'Expand the content with more detailed explanations',
          'Add examples and use cases',
          'Include troubleshooting steps if applicable',
          'Consider merging with related content'
        ],
        { wordCount, severity: 'medium' }
      );
    } else if (wordCount > this.config.maxWordCount) {
      return this.createIssue(
        'Content very lengthy',
        `Article contains ${wordCount} words, which may overwhelm readers.`,
        [
          'Consider breaking into multiple articles',
          'Use headers to improve scanability',
          'Remove redundant information',
          'Create a summary or overview section'
        ],
        { wordCount, severity: 'low' }
      );
    }
    return null;
  }

  checkReadability(content) {
    const score = this.calculateReadabilityScore(content);
    
    if (score < this.config.minReadabilityScore) {
      return this.createIssue(
        'Poor readability',
        `Content has a low readability score (${Math.round(score)}), indicating it may be difficult to read.`,
        [
          'Use shorter sentences and simpler words',
          'Break up long paragraphs',
          'Add bullet points and lists',
          'Use active voice instead of passive',
          'Define technical terms'
        ],
        { readabilityScore: Math.round(score), severity: 'high' }
      );
    } else if (score > this.config.maxReadabilityScore) {
      return this.createIssue(
        'Content may be too simple',
        `Content has a very high readability score (${Math.round(score)}), which might lack necessary detail.`,
        [
          'Add more detailed explanations',
          'Include technical specifics where appropriate',
          'Ensure content depth matches user needs',
          'Consider adding advanced sections'
        ],
        { readabilityScore: Math.round(score), severity: 'low' }
      );
    }
    
    return null;
  }

  checkGrammar(content) {
    const issues = [];
    const grammarProblems = this.checkBasicGrammar(content);
    
    if (grammarProblems.length > 0) {
      issues.push(this.createIssue(
        'Grammar and formatting issues',
        'Content contains potential grammar or formatting problems.',
        [
          'Review content for grammar errors',
          'Check punctuation and capitalization',
          'Use consistent formatting throughout',
          'Consider using a grammar checking tool'
        ],
        { 
          problems: grammarProblems.slice(0, 3),
          severity: 'medium' 
        }
      ));
    }

    // Check sentence length
    const sentences = this.getContentSentences(content);
    const longSentences = sentences.filter(sentence => 
      sentence.split(/\s+/).length > this.config.maxSentenceLength
    );

    if (longSentences.length > 0) {
      issues.push(this.createIssue(
        'Overly long sentences',
        `Found ${longSentences.length} sentences that may be too long for easy reading.`,
        [
          'Break long sentences into shorter ones',
          'Use conjunctions to separate ideas',
          'Consider using bullet points for lists',
          'Aim for 15-20 words per sentence'
        ],
        { 
          longSentenceCount: longSentences.length,
          severity: 'medium' 
        }
      ));
    }

    return issues;
  }

  checkStructure(content) {
    const headers = content.match(/^#+\s+(.+)$/gm) || [];
    
    if (this.config.requireHeaders && headers.length < this.config.minHeaderCount) {
      return this.createIssue(
        'Poor content structure',
        'Content lacks proper header structure for easy navigation.',
        [
          'Add descriptive headers to organize content',
          'Use H2 and H3 tags for main sections',
          'Create a logical hierarchy of information',
          'Consider adding a table of contents for long articles'
        ],
        { headerCount: headers.length, severity: 'medium' }
      );
    }

    // Check for proper introduction/conclusion
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length < 2) {
      return this.createIssue(
        'Lacks proper structure',
        'Content appears to be a single block without proper paragraph breaks.',
        [
          'Break content into logical paragraphs',
          'Add an introduction paragraph',
          'Include a conclusion or summary',
          'Use white space for better readability'
        ],
        { paragraphCount: paragraphs.length, severity: 'high' }
      );
    }

    return null;
  }

  checkFormatting(content) {
    const issues = [];

    // Check for code blocks without proper formatting
    const hasCodeContent = /```|`[^`]+`|\$\(|\${|function\s*\(|class\s+\w+|def\s+\w+/.test(content);
    const hasCodeBlocks = /```[\s\S]*?```|`[^`\n]+`/.test(content);
    
    if (hasCodeContent && !hasCodeBlocks) {
      issues.push(this.createIssue(
        'Unformatted code content',
        'Content appears to contain code that is not properly formatted.',
        [
          'Use code blocks (```) for multi-line code',
          'Use inline code (`) for short code snippets',
          'Add syntax highlighting where appropriate',
          'Ensure code examples are properly indented'
        ],
        { severity: 'medium' }
      ));
    }

    // Check for missing links formatting
    const hasUrlText = /https?:\/\/[^\s)]+/.test(content);
    const hasFormattedLinks = /\[([^\]]+)\]\([^)]+\)/.test(content);
    
    if (hasUrlText && !hasFormattedLinks) {
      issues.push(this.createIssue(
        'Unformatted URLs',
        'Content contains raw URLs that should be formatted as links.',
        [
          'Format URLs as proper markdown links',
          'Use descriptive link text instead of raw URLs',
          'Ensure all external links work correctly',
          'Consider using relative links for internal content'
        ],
        { severity: 'low' }
      ));
    }

    // Check for list formatting
    const hasListContent = /^\s*[-*+]\s+|\d+\.\s+/gm.test(content);
    const wellFormattedLists = /^[-*+]\s+.+$/gm.test(content) || /^\d+\.\s+.+$/gm.test(content);
    
    if (hasListContent && !wellFormattedLists) {
      issues.push(this.createIssue(
        'Poor list formatting',
        'Lists in the content may not be properly formatted.',
        [
          'Use consistent list formatting (- or *)',
          'Ensure proper spacing after list markers',
          'Use numbered lists for sequential steps',
          'Use bullet points for non-sequential items'
        ],
        { severity: 'low' }
      ));
    }

    return issues;
  }

  getContentSentences(content) {
    return content
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }

  consolidateQualityIssues(issues, metadata) {
    // Prioritize by severity and impact
    const severityOrder = { high: 3, medium: 2, low: 1 };
    
    issues.sort((a, b) => {
      const aSeverity = severityOrder[a.metadata?.severity || 'medium'];
      const bSeverity = severityOrder[b.metadata?.severity || 'medium'];
      return bSeverity - aSeverity;
    });

    const primaryIssue = issues[0];
    
    // Combine all suggestions
    const allSuggestions = issues.flatMap(issue => issue.suggestions);
    const uniqueSuggestions = [...new Set(allSuggestions)];
    
    return {
      ...primaryIssue,
      suggestions: uniqueSuggestions.slice(0, 8), // More suggestions for quality issues
      metadata: {
        ...primaryIssue.metadata,
        totalQualityIssues: issues.length,
        wordCount: metadata.wordCount,
        contentLength: metadata.contentLength,
        allIssueTypes: issues.map(i => i.issue)
      }
    };
  }

  validateConfig(config) {
    return (
      config.minWordCount > 0 &&
      config.maxWordCount > config.minWordCount &&
      config.minReadabilityScore >= 0 &&
      config.maxReadabilityScore <= 100 &&
      config.maxSentenceLength > 5
    );
  }
}

module.exports = ContentQualityRule; 