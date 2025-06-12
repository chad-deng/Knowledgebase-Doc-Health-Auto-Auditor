const BaseRule = require('./BaseRule');

/**
 * SEO Optimization Rule - Analyzes content for search engine optimization
 * Checks meta information, keywords, structure, and SEO best practices
 */
class SEOOptimizationRule extends BaseRule {
  constructor() {
    super({
      id: 'seo-optimization',
      name: 'SEO Optimization Analysis',
      description: 'Evaluates content for search engine optimization including keywords, structure, and meta information',
      category: 'seo',
      severity: 'low',
      version: '1.0.0',
      author: 'StoreHub Team',
      tags: ['seo', 'keywords', 'optimization', 'structure'],
      configurable: true,
      ruleConfig: {
        checkKeywordDensity: true,
        maxKeywordDensity: 0.03, // 3% max keyword density
        minKeywordDensity: 0.005, // 0.5% min keyword density
        checkHeadingStructure: true,
        checkMetaElements: true,
        checkInternalLinks: true,
        checkImageAltText: true,
        minContentLength: 300, // Minimum words for good SEO
        maxContentLength: 2500, // Maximum words before it's too long
        targetKeywords: [] // Will be populated based on title/tags
      }
    });
  }

  async execute(context) {
    const { article, metadata } = context;
    
    if (!article.content) {
      return null;
    }

    const issues = [];

    // Derive target keywords from title and tags
    const keywords = this.extractKeywords(article.title, article.tags);

    // Check content length for SEO
    const lengthIssue = this.checkContentLengthSEO(metadata.wordCount);
    if (lengthIssue) {
      issues.push(lengthIssue);
    }

    // Check heading structure
    if (this.config.checkHeadingStructure) {
      const headingIssue = this.checkHeadingStructure(article.content);
      if (headingIssue) {
        issues.push(headingIssue);
      }
    }

    // Check keyword usage
    if (this.config.checkKeywordDensity && keywords.length > 0) {
      const keywordIssues = this.checkKeywordOptimization(article.content, keywords);
      issues.push(...keywordIssues);
    }

    // Check meta elements (if available)
    if (this.config.checkMetaElements) {
      const metaIssues = this.checkMetaElements(article);
      issues.push(...metaIssues);
    }

    // Check image optimization
    if (this.config.checkImageAltText) {
      const imageIssue = this.checkImageOptimization(article.content);
      if (imageIssue) {
        issues.push(imageIssue);
      }
    }

    // Check internal linking
    if (this.config.checkInternalLinks) {
      const linkIssue = this.checkInternalLinking(article.content);
      if (linkIssue) {
        issues.push(linkIssue);
      }
    }

    return issues.length > 0 ? this.consolidateSEOIssues(issues, keywords) : null;
  }

  extractKeywords(title, tags) {
    const keywords = [];
    
    if (title) {
      // Extract meaningful words from title (exclude common words)
      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'how', 'what', 'when', 'where', 'why'];
      const titleWords = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
      keywords.push(...titleWords);
    }
    
    if (tags && Array.isArray(tags)) {
      keywords.push(...tags.map(tag => tag.toLowerCase()));
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  checkContentLengthSEO(wordCount) {
    if (wordCount < this.config.minContentLength) {
      return this.createIssue(
        'Content too short for SEO',
        `Content has ${wordCount} words. SEO typically favors longer, more comprehensive content.`,
        [
          'Expand content to at least 300 words',
          'Add more detailed explanations and examples',
          'Include relevant background information',
          'Add FAQ or troubleshooting sections'
        ],
        { wordCount, severity: 'medium' }
      );
    } else if (wordCount > this.config.maxContentLength) {
      return this.createIssue(
        'Content may be too long',
        `Very long content (${wordCount} words) may affect user engagement and SEO.`,
        [
          'Consider breaking into multiple focused articles',
          'Use clear headings to improve scanability',
          'Add a table of contents for navigation',
          'Ensure content density remains high throughout'
        ],
        { wordCount, severity: 'low' }
      );
    }
    
    return null;
  }

  checkHeadingStructure(content) {
    const headings = content.match(/^(#{1,6})\s+(.+)$/gm) || [];
    
    if (headings.length === 0) {
      return this.createIssue(
        'Missing heading structure',
        'Content lacks heading structure, which is important for SEO and readability.',
        [
          'Add H2 and H3 headings to structure content',
          'Use headings to break up long sections',
          'Include target keywords in headings where appropriate',
          'Create a logical hierarchy of information'
        ],
        { severity: 'medium' }
      );
    }

    // Check heading hierarchy
    const headingLevels = headings.map(h => h.match(/^(#{1,6})/)[1].length);
    const hasH1 = headingLevels.includes(1);
    const hasProperHierarchy = this.checkHeadingHierarchy(headingLevels);

    if (!hasProperHierarchy) {
      return this.createIssue(
        'Poor heading hierarchy',
        'Heading structure doesn\'t follow proper hierarchy (H1 → H2 → H3, etc.).',
        [
          'Organize headings in proper hierarchy',
          'Use H1 for main title, H2 for sections, H3 for subsections',
          'Avoid skipping heading levels',
          'Ensure logical content flow'
        ],
        { 
          headingCount: headings.length,
          hasH1,
          severity: 'medium' 
        }
      );
    }

    return null;
  }

  checkHeadingHierarchy(levels) {
    if (levels.length === 0) return false;
    
    let expectedLevel = 1;
    for (const level of levels) {
      if (level > expectedLevel + 1) {
        return false; // Skipped a level
      }
      expectedLevel = Math.min(level + 1, 6);
    }
    return true;
  }

  checkKeywordOptimization(content, keywords) {
    const issues = [];
    const contentWords = content.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = contentWords.length;

    for (const keyword of keywords.slice(0, 3)) { // Check top 3 keywords
      const keywordOccurrences = contentWords.filter(word => 
        word === keyword || word.includes(keyword)
      ).length;
      
      const density = keywordOccurrences / totalWords;

      if (density < this.config.minKeywordDensity) {
        issues.push(this.createIssue(
          'Low keyword density',
          `Keyword "${keyword}" appears only ${keywordOccurrences} times (${(density * 100).toFixed(1)}% density).`,
          [
            'Include target keywords more naturally in content',
            'Use keywords in headings and subheadings',
            'Add keyword variations and synonyms',
            'Ensure keywords appear in the first paragraph'
          ],
          { 
            keyword,
            occurrences: keywordOccurrences,
            density: Math.round(density * 1000) / 10,
            severity: 'low'
          }
        ));
      } else if (density > this.config.maxKeywordDensity) {
        issues.push(this.createIssue(
          'Keyword over-optimization',
          `Keyword "${keyword}" appears ${keywordOccurrences} times (${(density * 100).toFixed(1)}% density), which may be excessive.`,
          [
            'Reduce keyword repetition to avoid over-optimization',
            'Use natural language and keyword variations',
            'Focus on content quality over keyword density',
            'Consider using synonyms and related terms'
          ],
          { 
            keyword,
            occurrences: keywordOccurrences,
            density: Math.round(density * 1000) / 10,
            severity: 'medium'
          }
        ));
      }
    }

    return issues;
  }

  checkMetaElements(article) {
    const issues = [];

    // Check title length
    if (article.title) {
      const titleLength = article.title.length;
      if (titleLength < 30) {
        issues.push(this.createIssue(
          'Title too short',
          'Title is shorter than recommended for SEO (30-60 characters).',
          [
            'Expand title to 30-60 characters',
            'Include primary keywords in title',
            'Make title descriptive and compelling',
            'Consider user search intent'
          ],
          { titleLength, severity: 'medium' }
        ));
      } else if (titleLength > 60) {
        issues.push(this.createIssue(
          'Title too long',
          'Title may be truncated in search results (over 60 characters).',
          [
            'Shorten title to under 60 characters',
            'Place important keywords at the beginning',
            'Remove unnecessary words and phrases',
            'Maintain clarity and relevance'
          ],
          { titleLength, severity: 'medium' }
        ));
      }
    }

    // Check for description/excerpt
    if (!article.description && !article.excerpt) {
      issues.push(this.createIssue(
        'Missing meta description',
        'Article lacks a meta description, which is important for search results.',
        [
          'Add a compelling meta description (150-160 characters)',
          'Include primary keywords naturally',
          'Summarize the article\'s value proposition',
          'Make it actionable and click-worthy'
        ],
        { severity: 'high' }
      ));
    }

    return issues;
  }

  checkImageOptimization(content) {
    const images = content.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
    
    if (images.length === 0) {
      return null; // No images to check
    }

    const imagesWithoutAlt = images.filter(img => {
      const altMatch = img.match(/!\[([^\]]*)\]/);
      return !altMatch || !altMatch[1] || altMatch[1].trim().length === 0;
    });

    if (imagesWithoutAlt.length > 0) {
      return this.createIssue(
        'Images missing alt text',
        `Found ${imagesWithoutAlt.length} images without proper alt text.`,
        [
          'Add descriptive alt text to all images',
          'Include relevant keywords in alt text naturally',
          'Describe image content for accessibility',
          'Keep alt text concise but informative'
        ],
        { 
          totalImages: images.length,
          missingAlt: imagesWithoutAlt.length,
          severity: 'medium' 
        }
      );
    }

    return null;
  }

  checkInternalLinking(content) {
    const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    const internalLinks = links.filter(link => {
      const urlMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      return urlMatch && !urlMatch[2].startsWith('http');
    });

    if (internalLinks.length === 0 && links.length > 0) {
      return this.createIssue(
        'No internal links found',
        'Content has external links but no internal links to other articles.',
        [
          'Add links to related articles in your knowledge base',
          'Link to relevant documentation or guides',
          'Use descriptive anchor text for internal links',
          'Create content clusters through strategic linking'
        ],
        { 
          totalLinks: links.length,
          severity: 'low' 
        }
      );
    }

    return null;
  }

  consolidateSEOIssues(issues, keywords) {
    // Sort by severity
    const severityOrder = { high: 3, medium: 2, low: 1 };
    
    issues.sort((a, b) => {
      const aSeverity = severityOrder[a.metadata?.severity || 'low'];
      const bSeverity = severityOrder[b.metadata?.severity || 'low'];
      return bSeverity - aSeverity;
    });

    const primaryIssue = issues[0];
    
    // Combine suggestions
    const allSuggestions = issues.flatMap(issue => issue.suggestions);
    const uniqueSuggestions = [...new Set(allSuggestions)];
    
    return {
      ...primaryIssue,
      suggestions: uniqueSuggestions.slice(0, 8), // More SEO suggestions
      metadata: {
        ...primaryIssue.metadata,
        totalSEOIssues: issues.length,
        targetKeywords: keywords.slice(0, 3),
        allIssueTypes: issues.map(i => i.issue)
      }
    };
  }

  validateConfig(config) {
    return (
      config.maxKeywordDensity > 0 &&
      config.maxKeywordDensity <= 1 &&
      config.minKeywordDensity >= 0 &&
      config.minKeywordDensity < config.maxKeywordDensity &&
      config.minContentLength > 0 &&
      config.maxContentLength > config.minContentLength
    );
  }
}

module.exports = SEOOptimizationRule; 