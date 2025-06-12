const BaseRule = require('./BaseRule');

/**
 * Broken Links Rule - Detects potentially broken or problematic links
 * Analyzes internal links, external URLs, and link formatting
 */
class BrokenLinksRule extends BaseRule {
  constructor() {
    super({
      id: 'broken-links',
      name: 'Broken Links Detection',
      description: 'Identifies potentially broken links, malformed URLs, and link-related issues',
      category: 'technical',
      severity: 'high',
      version: '1.0.0',
      author: 'StoreHub Team',
      tags: ['links', 'urls', 'navigation', 'technical'],
      configurable: true,
      ruleConfig: {
        checkExternalLinks: true,
        checkInternalLinks: true,
        checkLinkFormatting: true,
        suspiciousDomains: [
          'localhost', '127.0.0.1', '192.168.', '10.0.0.',
          'staging.', 'test.', 'dev.', 'demo.'
        ],
        deprecatedDomains: [
          'example.com', 'test.com', 'localhost.com'
        ]
      }
    });
  }

  async execute(context) {
    const { article } = context;
    
    if (!article.content) {
      return null;
    }

    const issues = [];

    // Extract all links from content
    const links = this.extractAllLinks(article.content);
    
    if (links.length === 0) {
      return null; // No links to check
    }

    // Check for problematic URLs
    const urlIssues = this.checkUrls(links);
    issues.push(...urlIssues);

    // Check link formatting
    if (this.config.checkLinkFormatting) {
      const formattingIssues = this.checkLinkFormatting(article.content, links);
      issues.push(...formattingIssues);
    }

    // Check for duplicate links
    const duplicateIssues = this.checkDuplicateLinks(links);
    issues.push(...duplicateIssues);

    return issues.length > 0 ? this.consolidateLinkIssues(issues, links.length) : null;
  }

  extractAllLinks(content) {
    const links = [];
    
    // Markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      links.push({
        type: 'markdown',
        text: match[1],
        url: match[2],
        fullMatch: match[0]
      });
    }

    // Raw URLs
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    while ((match = urlRegex.exec(content)) !== null) {
      // Skip if already captured as markdown link
      const isInMarkdownLink = links.some(link => 
        link.type === 'markdown' && link.url === match[0]
      );
      
      if (!isInMarkdownLink) {
        links.push({
          type: 'raw',
          text: match[0],
          url: match[0],
          fullMatch: match[0]
        });
      }
    }

    // HTML links (if any)
    const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi;
    while ((match = htmlLinkRegex.exec(content)) !== null) {
      links.push({
        type: 'html',
        text: match[3],
        url: match[2],
        fullMatch: match[0]
      });
    }

    return links;
  }

  checkUrls(links) {
    const issues = [];
    const problematicLinks = [];

    for (const link of links) {
      const problems = this.analyzeUrl(link.url);
      if (problems.length > 0) {
        problematicLinks.push({
          ...link,
          problems
        });
      }
    }

    if (problematicLinks.length > 0) {
      issues.push(this.createIssue(
        'Problematic URLs detected',
        `Found ${problematicLinks.length} links that may be broken or problematic.`,
        [
          'Review and update problematic URLs',
          'Test all external links for accessibility',
          'Replace development/staging URLs with production URLs',
          'Remove or fix malformed URLs',
          'Consider using relative paths for internal links'
        ],
        {
          problematicCount: problematicLinks.length,
          examples: problematicLinks.slice(0, 3).map(l => ({
            url: l.url,
            problems: l.problems
          })),
          severity: 'high'
        }
      ));
    }

    return issues;
  }

  analyzeUrl(url) {
    const problems = [];

    // Check for suspicious domains
    for (const domain of this.config.suspiciousDomains) {
      if (url.toLowerCase().includes(domain)) {
        problems.push(`Contains suspicious domain: ${domain}`);
      }
    }

    // Check for deprecated domains
    for (const domain of this.config.deprecatedDomains) {
      if (url.toLowerCase().includes(domain)) {
        problems.push(`Uses deprecated domain: ${domain}`);
      }
    }

    // Check for malformed URLs
    try {
      const urlObj = new URL(url);
      
      // Check for common issues
      if (urlObj.hostname === '') {
        problems.push('Empty hostname');
      }
      
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        problems.push(`Unsupported protocol: ${urlObj.protocol}`);
      }

      // Check for unencoded spaces
      if (url.includes(' ')) {
        problems.push('Contains unencoded spaces');
      }

      // Check for double slashes in path
      if (urlObj.pathname.includes('//')) {
        problems.push('Contains double slashes in path');
      }

    } catch (error) {
      problems.push('Malformed URL structure');
    }

    // Check for insecure HTTP
    if (url.startsWith('http://') && !url.includes('localhost')) {
      problems.push('Uses insecure HTTP protocol');
    }

    // Check for very long URLs
    if (url.length > 2000) {
      problems.push('URL is extremely long');
    }

    return problems;
  }

  checkLinkFormatting(content, links) {
    const issues = [];

    // Check for raw URLs that should be formatted
    const rawUrls = links.filter(link => link.type === 'raw');
    if (rawUrls.length > 0) {
      issues.push(this.createIssue(
        'Unformatted URLs',
        `Found ${rawUrls.length} raw URLs that should be formatted as proper links.`,
        [
          'Convert raw URLs to markdown links with descriptive text',
          'Use meaningful link text instead of displaying URLs',
          'Follow accessibility guidelines for link text',
          'Consider shortening very long URLs'
        ],
        {
          rawUrlCount: rawUrls.length,
          examples: rawUrls.slice(0, 3).map(l => l.url),
          severity: 'medium'
        }
      ));
    }

    // Check for poor link text
    const markdownLinks = links.filter(link => link.type === 'markdown');
    const poorLinkText = markdownLinks.filter(link => {
      const text = link.text.toLowerCase().trim();
      return (
        text === 'here' ||
        text === 'click here' ||
        text === 'link' ||
        text === 'this' ||
        text === 'read more' ||
        text === link.url ||
        text.length < 3
      );
    });

    if (poorLinkText.length > 0) {
      issues.push(this.createIssue(
        'Poor link text',
        `Found ${poorLinkText.length} links with non-descriptive text.`,
        [
          'Use descriptive text that indicates link destination',
          'Avoid generic phrases like "click here" or "read more"',
          'Make link text meaningful out of context',
          'Follow accessibility best practices for link text'
        ],
        {
          poorLinkCount: poorLinkText.length,
          examples: poorLinkText.slice(0, 3).map(l => ({
            text: l.text,
            url: l.url
          })),
          severity: 'medium'
        }
      ));
    }

    return issues;
  }

  checkDuplicateLinks(links) {
    const issues = [];
    const urlCounts = {};

    // Count occurrences of each URL
    links.forEach(link => {
      const url = link.url.toLowerCase();
      urlCounts[url] = (urlCounts[url] || 0) + 1;
    });

    // Find duplicates
    const duplicates = Object.entries(urlCounts)
      .filter(([url, count]) => count > 1)
      .map(([url, count]) => ({ url, count }));

    if (duplicates.length > 0) {
      issues.push(this.createIssue(
        'Duplicate links detected',
        `Found ${duplicates.length} URLs that appear multiple times in the content.`,
        [
          'Review duplicate links for necessity',
          'Consider consolidating repetitive links',
          'Use internal references instead of repeating URLs',
          'Ensure duplicate links serve different purposes'
        ],
        {
          duplicateCount: duplicates.length,
          examples: duplicates.slice(0, 3),
          severity: 'low'
        }
      ));
    }

    return issues;
  }

  consolidateLinkIssues(issues, totalLinks) {
    // Sort by severity
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
        totalLinkIssues: issues.length,
        totalLinksFound: totalLinks,
        allIssueTypes: issues.map(i => i.issue)
      }
    };
  }

  validateConfig(config) {
    return (
      Array.isArray(config.suspiciousDomains) &&
      Array.isArray(config.deprecatedDomains)
    );
  }
}

module.exports = BrokenLinksRule; 