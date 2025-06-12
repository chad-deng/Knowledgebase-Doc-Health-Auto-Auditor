const BaseRule = require('./BaseRule');

/**
 * Outdated Content Rule - Detects content that may be stale or outdated
 * Analyzes last modification dates, version references, and temporal language
 */
class OutdatedContentRule extends BaseRule {
  constructor() {
    super({
      id: 'outdated-content',
      name: 'Outdated Content Detection',
      description: 'Identifies articles that may contain outdated information based on age, version references, and temporal language',
      category: 'content-quality',
      severity: 'high',
      version: '1.2.0',
      author: 'StoreHub Team',
      tags: ['outdated', 'maintenance', 'freshness'],
      configurable: true,
      ruleConfig: {
        maxAgeMonths: 12,
        criticalAgeMonths: 18,
        checkVersionReferences: true,
        checkTemporalLanguage: true,
        temporalKeywords: [
          'last year', 'this year', 'currently', 'at the moment',
          'recently', 'soon', 'upcoming', 'latest version',
          'new feature', 'beta', 'coming soon'
        ]
      }
    });
  }

  async execute(context) {
    const issues = [];
    const { article, metadata } = context;
    
    // Check content age
    const ageIssue = this.checkContentAge(metadata.age);
    if (ageIssue) {
      issues.push(ageIssue);
    }

    // Check for version references
    if (this.config.checkVersionReferences) {
      const versionIssues = this.checkVersionReferences(article.content);
      issues.push(...versionIssues);
    }

    // Check for temporal language
    if (this.config.checkTemporalLanguage) {
      const temporalIssues = this.checkTemporalLanguage(article.content);
      issues.push(...temporalIssues);
    }

    // Check for outdated technology references
    const techIssues = this.checkOutdatedTechnology(article.content);
    issues.push(...techIssues);

    // Return the most significant issue or null if no issues
    return issues.length > 0 ? this.consolidateIssues(issues, metadata.age) : null;
  }

  checkContentAge(ageDays) {
    const ageMonths = ageDays / 30;
    
    if (ageMonths > this.config.criticalAgeMonths) {
      return this.createIssue(
        'Critically outdated content',
        `This article hasn't been updated in ${Math.round(ageMonths)} months and may contain significantly outdated information.`,
        [
          'Review and update the content immediately',
          'Verify all information is still accurate',
          'Update any changed procedures or features',
          'Consider archiving if no longer relevant'
        ],
        { ageMonths: Math.round(ageMonths), severity: 'critical' }
      );
    } else if (ageMonths > this.config.maxAgeMonths) {
      return this.createIssue(
        'Potentially outdated content',
        `This article is ${Math.round(ageMonths)} months old and should be reviewed for accuracy.`,
        [
          'Review content for accuracy',
          'Update any changed information',
          'Refresh examples and screenshots',
          'Update the "last reviewed" date'
        ],
        { ageMonths: Math.round(ageMonths), severity: 'high' }
      );
    }

    return null;
  }

  checkVersionReferences(content) {
    if (!content) return [];
    
    const issues = [];
    const versionPatterns = [
      /version\s+(\d+\.?\d*\.?\d*)/gi,
      /v(\d+\.?\d*\.?\d*)/gi,
      /(\d+\.?\d*\.?\d*)\s+(update|release)/gi
    ];

    for (const pattern of versionPatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        issues.push(this.createIssue(
          'Version references detected',
          'Content contains specific version numbers that may become outdated.',
          [
            'Review version references for accuracy',
            'Consider using "latest version" instead of specific numbers',
            'Update version numbers if they\'re outdated',
            'Add a note about when version info was last checked'
          ],
          { 
            versions: matches.slice(0, 3), // Limit to first 3 matches
            severity: 'medium' 
          }
        ));
        break; // Only report once per article
      }
    }

    return issues;
  }

  checkTemporalLanguage(content) {
    if (!content) return [];
    
    const issues = [];
    const foundKeywords = [];
    
    const contentLower = content.toLowerCase();
    for (const keyword of this.config.temporalKeywords) {
      if (contentLower.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    if (foundKeywords.length > 0) {
      issues.push(this.createIssue(
        'Temporal language detected',
        'Content uses time-sensitive language that may become inaccurate.',
        [
          'Replace temporal language with specific dates',
          'Use evergreen language where possible',
          'Add specific update dates for time-sensitive information',
          'Review and update temporal references regularly'
        ],
        { 
          keywords: foundKeywords.slice(0, 5), // Limit to first 5
          severity: 'medium' 
        }
      ));
    }

    return issues;
  }

  checkOutdatedTechnology(content) {
    if (!content) return [];
    
    const outdatedTech = [
      'internet explorer', 'ie6', 'ie7', 'ie8', 'ie9',
      'flash player', 'adobe flash', 'silverlight',
      'windows xp', 'windows vista', 'windows 7',
      'jquery 1.', 'angular 1.', 'angularjs',
      'php 5.', 'python 2.', 'node 0.', 'node 6.',
      'http://', // Insecure protocol references
    ];

    const issues = [];
    const contentLower = content.toLowerCase();
    const foundTech = [];

    for (const tech of outdatedTech) {
      if (contentLower.includes(tech)) {
        foundTech.push(tech);
      }
    }

    if (foundTech.length > 0) {
      issues.push(this.createIssue(
        'Outdated technology references',
        'Content references potentially outdated technologies or versions.',
        [
          'Update technology references to current versions',
          'Remove references to deprecated technologies',
          'Verify all technical information is current',
          'Consider adding browser/system requirements'
        ],
        { 
          technologies: foundTech.slice(0, 3),
          severity: 'high' 
        }
      ));
    }

    return issues;
  }

  consolidateIssues(issues, ageDays) {
    // Sort by severity and return the most critical issue
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    issues.sort((a, b) => {
      const aSeverity = severityOrder[a.metadata?.severity || 'medium'];
      const bSeverity = severityOrder[b.metadata?.severity || 'medium'];
      return bSeverity - aSeverity;
    });

    const primaryIssue = issues[0];
    
    // Add summary of all issues found
    const allSuggestions = issues.flatMap(issue => issue.suggestions);
    const uniqueSuggestions = [...new Set(allSuggestions)];
    
    return {
      ...primaryIssue,
      suggestions: uniqueSuggestions.slice(0, 6), // Limit suggestions
      metadata: {
        ...primaryIssue.metadata,
        totalIssuesFound: issues.length,
        ageDays,
        allIssueTypes: issues.map(i => i.issue)
      }
    };
  }

  validateConfig(config) {
    return (
      config.maxAgeMonths > 0 &&
      config.criticalAgeMonths > config.maxAgeMonths &&
      Array.isArray(config.temporalKeywords)
    );
  }
}

module.exports = OutdatedContentRule; 