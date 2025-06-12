const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs/promises');
const path = require('path');

/**
 * KnowledgeBaseCrawler - Advanced web scraping and knowledge base integration
 * 
 * Features:
 * - Web scraping with Puppeteer for dynamic content
 * - Static HTML parsing with Cheerio for performance
 * - Knowledge base platform API integrations
 * - Content synchronization and update detection
 * - Intelligent content extraction and structuring
 */
class KnowledgeBaseCrawler {
    constructor() {
        this.browser = null;
        this.supportedPlatforms = ['confluence', 'notion', 'gitbook', 'generic'];
        this.crawlHistory = new Map();
        this.contentCache = new Map();
        this.updateListeners = [];
    }

    /**
     * Initialize the crawler with browser instance
     */
    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
                timeout: 30000
            });
            console.log('🚀 KnowledgeBaseCrawler initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize crawler:', error);
            return false;
        }
    }

    /**
     * Generic web scraping for any URL
     * @param {string} url - URL to scrape
     * @param {Object} options - Scraping options
     * @returns {Object} Extracted content
     */
    async scrapeURL(url, options = {}) {
        const {
            waitForSelector = null,
            extractImages = false,
            extractLinks = true,
            customSelectors = {},
            timeout = 30000
        } = options;

        if (!this.browser) {
            await this.initialize();
        }

        const page = await this.browser.newPage();
        
        try {
            // Navigate to URL with timeout
            await page.goto(url, { waitUntil: 'networkidle2', timeout });
            
            // Wait for specific selector if provided
            if (waitForSelector) {
                await page.waitForSelector(waitForSelector, { timeout: 10000 });
            }

            // Extract content using page.evaluate
            const content = await page.evaluate((selectors, extractImages, extractLinks) => {
                // Helper function to clean text
                const cleanText = (text) => {
                    return text.replace(/\s+/g, ' ').trim();
                };

                // Extract main content
                const titleElement = document.querySelector('h1, title, .title, [data-title]');
                const title = titleElement ? cleanText(titleElement.textContent) : 'Untitled';

                // Try multiple content selectors
                const contentSelectors = [
                    'main', '.content', '.article-content', '.post-content', 
                    '.documentation', '.wiki-content', '.page-content',
                    'article', '.markdown-body'
                ];

                let mainContent = '';
                for (const selector of contentSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        mainContent = cleanText(element.textContent);
                        break;
                    }
                }

                // Fallback to body if no specific content found
                if (!mainContent) {
                    mainContent = cleanText(document.body.textContent);
                }

                // Extract headings structure
                const headings = [];
                document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                    headings.push({
                        level: parseInt(heading.tagName.substring(1)),
                        text: cleanText(heading.textContent),
                        id: heading.id || null
                    });
                });

                // Extract metadata
                const meta = {};
                document.querySelectorAll('meta').forEach(metaTag => {
                    const name = metaTag.getAttribute('name') || metaTag.getAttribute('property');
                    const content = metaTag.getAttribute('content');
                    if (name && content) {
                        meta[name] = content;
                    }
                });

                // Extract images if requested
                const images = [];
                if (extractImages) {
                    document.querySelectorAll('img').forEach(img => {
                        const src = img.getAttribute('src');
                        const alt = img.getAttribute('alt') || '';
                        if (src) {
                            images.push({ src, alt });
                        }
                    });
                }

                // Extract links if requested
                const links = [];
                if (extractLinks) {
                    document.querySelectorAll('a[href]').forEach(link => {
                        const href = link.getAttribute('href');
                        const text = cleanText(link.textContent);
                        if (href && text) {
                            links.push({ href, text });
                        }
                    });
                }

                // Extract custom selectors
                const customData = {};
                Object.keys(selectors).forEach(key => {
                    const element = document.querySelector(selectors[key]);
                    if (element) {
                        customData[key] = cleanText(element.textContent);
                    }
                });

                return {
                    title,
                    content: mainContent,
                    headings,
                    meta,
                    images,
                    links,
                    customData,
                    wordCount: mainContent.split(/\s+/).length,
                    lastModified: document.lastModified || null
                };
            }, customSelectors, extractImages, extractLinks);

            // Add scraping metadata
            const scrapedContent = {
                ...content,
                url,
                scrapedAt: new Date().toISOString(),
                platform: this.detectPlatform(url),
                hash: this.generateContentHash(content.content)
            };

            // Cache the content
            this.contentCache.set(url, scrapedContent);
            this.crawlHistory.set(url, {
                lastCrawled: new Date().toISOString(),
                hash: scrapedContent.hash,
                success: true
            });

            return scrapedContent;

        } catch (error) {
            console.error(`❌ Error scraping ${url}:`, error);
            
            // Record failed attempt
            this.crawlHistory.set(url, {
                lastCrawled: new Date().toISOString(),
                success: false,
                error: error.message
            });

            throw error;
        } finally {
            await page.close();
        }
    }

    /**
     * Confluence-specific integration
     * @param {Object} config - Confluence configuration
     * @returns {Array} Extracted articles
     */
    async crawlConfluence(config) {
        const {
            baseUrl,
            spaceKey,
            username,
            apiToken,
            maxPages = 50
        } = config;

        const articles = [];
        let startAt = 0;
        const limit = 10;

        try {
            while (articles.length < maxPages) {
                // Confluence REST API call
                const apiUrl = `${baseUrl}/rest/api/content`;
                const params = new URLSearchParams({
                    spaceKey,
                    expand: 'body.storage,metadata.labels,version,space',
                    limit,
                    start: startAt
                });

                const response = await fetch(`${apiUrl}?${params}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Confluence API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                
                if (!data.results || data.results.length === 0) {
                    break;
                }

                // Process each page
                for (const page of data.results) {
                    const article = {
                        id: `confluence-${page.id}`,
                        title: page.title,
                        content: this.parseConfluenceContent(page.body.storage.value),
                        url: `${baseUrl}${page._links.webui}`,
                        platform: 'confluence',
                        spaceKey: page.space.key,
                        spaceName: page.space.name,
                        version: page.version.number,
                        lastModified: page.version.when,
                        author: page.version.by.displayName,
                        labels: page.metadata.labels.results.map(label => label.name),
                        type: page.type,
                        status: page.status,
                        crawledAt: new Date().toISOString()
                    };

                    articles.push(article);
                }

                startAt += limit;

                // Rate limiting
                await this.delay(100);
            }

            console.log(`✅ Successfully crawled ${articles.length} articles from Confluence space: ${spaceKey}`);
            return articles;

        } catch (error) {
            console.error('❌ Error crawling Confluence:', error);
            throw error;
        }
    }

    /**
     * Parse Confluence storage format content
     * @param {string} storageContent - Confluence storage format
     * @returns {string} Plain text content
     */
    parseConfluenceContent(storageContent) {
        const $ = cheerio.load(storageContent);
        
        // Remove unwanted elements
        $('ac\\:structured-macro[ac\\:name="code"], code, pre').remove();
        $('ac\\:image, img').replaceWith('[IMAGE]');
        $('ac\\:link, a').each(function() {
            const text = $(this).text();
            $(this).replaceWith(text);
        });

        // Convert headings
        $('h1, h2, h3, h4, h5, h6').each(function() {
            const level = parseInt(this.tagName.substring(1));
            const text = $(this).text();
            $(this).replaceWith(`${'#'.repeat(level)} ${text}\n\n`);
        });

        // Convert lists
        $('ul li').each(function() {
            $(this).replaceWith(`- ${$(this).text()}\n`);
        });
        $('ol li').each(function() {
            $(this).replaceWith(`1. ${$(this).text()}\n`);
        });

        // Get clean text
        return $.text().replace(/\s+/g, ' ').trim();
    }

    /**
     * Batch crawl multiple URLs
     * @param {Array} urls - Array of URLs to crawl
     * @param {Object} options - Crawling options
     * @returns {Array} Results from all crawls
     */
    async batchCrawl(urls, options = {}) {
        const { concurrency = 3, delayBetween = 1000 } = options;
        const results = [];
        
        console.log(`🔄 Starting batch crawl of ${urls.length} URLs with concurrency ${concurrency}`);

        // Process URLs in batches
        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            
            const promises = batch.map(async (url) => {
                try {
                    const result = await this.scrapeURL(url, options);
                    console.log(`✅ Successfully crawled: ${url}`);
                    return { url, success: true, data: result };
                } catch (error) {
                    console.error(`❌ Failed to crawl: ${url}`, error.message);
                    return { url, success: false, error: error.message };
                }
            });

            const batchResults = await Promise.allSettled(promises);
            results.push(...batchResults.map(r => r.value || r.reason));

            // Delay between batches
            if (i + concurrency < urls.length) {
                await this.delay(delayBetween);
            }
        }

        const successful = results.filter(r => r.success).length;
        console.log(`✅ Batch crawl completed: ${successful}/${urls.length} successful`);

        return results;
    }

    /**
     * Content synchronization - detect changes
     * @param {string} url - URL to check for updates
     * @returns {Object} Sync status
     */
    async syncContent(url) {
        const history = this.crawlHistory.get(url);
        
        if (!history) {
            // First time crawling
            const content = await this.scrapeURL(url);
            return { 
                status: 'new',
                content,
                changes: null
            };
        }

        // Re-crawl and compare
        try {
            const newContent = await this.scrapeURL(url);
            const oldHash = history.hash;
            const newHash = newContent.hash;

            if (oldHash === newHash) {
                return {
                    status: 'unchanged',
                    content: newContent,
                    changes: null
                };
            } else {
                return {
                    status: 'updated',
                    content: newContent,
                    changes: {
                        oldHash,
                        newHash,
                        lastModified: newContent.lastModified
                    }
                };
            }
        } catch (error) {
            return {
                status: 'error',
                error: error.message,
                changes: null
            };
        }
    }

    /**
     * Detect platform type from URL
     * @param {string} url - URL to analyze
     * @returns {string} Platform type
     */
    detectPlatform(url) {
        if (url.includes('confluence')) return 'confluence';
        if (url.includes('notion')) return 'notion';
        if (url.includes('gitbook')) return 'gitbook';
        if (url.includes('github')) return 'github';
        return 'generic';
    }

    /**
     * Generate content hash for change detection
     * @param {string} content - Content to hash
     * @returns {string} Hash string
     */
    generateContentHash(content) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(content).digest('hex');
    }

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get crawl statistics
     * @returns {Object} Crawl statistics
     */
    getStats() {
        const totalCrawls = this.crawlHistory.size;
        const successful = Array.from(this.crawlHistory.values()).filter(h => h.success).length;
        const cached = this.contentCache.size;

        return {
            totalCrawls,
            successful,
            failed: totalCrawls - successful,
            cached,
            successRate: totalCrawls > 0 ? (successful / totalCrawls * 100).toFixed(2) : 0
        };
    }

    /**
     * Clear cache and history
     */
    clearCache() {
        this.contentCache.clear();
        this.crawlHistory.clear();
        console.log('🗑️  Cache and crawl history cleared');
    }

    /**
     * Close browser instance
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('🔒 KnowledgeBaseCrawler closed');
        }
    }
}

module.exports = KnowledgeBaseCrawler;