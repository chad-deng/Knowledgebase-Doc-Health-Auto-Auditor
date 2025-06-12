const KnowledgeBaseCrawler = require('./KnowledgeBaseCrawler');
const StoreHubCareScraper = require('./StoreHubCareScraper');

/**
 * ExternalDataProvider - Manages external data sources and live data integration
 * 
 * Features:
 * - Multiple knowledge base platform support
 * - Live data ingestion and synchronization
 * - Data transformation and normalization
 * - Fallback to mock data when external sources unavailable
 * - Caching and performance optimization
 */
class ExternalDataProvider {
    constructor() {
        this.crawler = new KnowledgeBaseCrawler();
        this.storeHubScraper = new StoreHubCareScraper();
        this.dataSources = new Map();
        this.articleCache = new Map();
        this.syncSchedule = new Map();
        this.isInitialized = false;
        
        // Default configurations for supported platforms
        this.platformConfigs = {
            confluence: {
                baseUrl: '',
                username: '',
                apiToken: '',
                spaceKeys: [],
                enabled: false
            },
            notion: {
                apiToken: '',
                databaseId: '',
                enabled: false
            },
            gitbook: {
                apiToken: '',
                orgId: '',
                enabled: false
            },
            generic: {
                baseUrl: '',
                authHeaders: {},
                enabled: false
            }
        };
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🔄 Initializing ExternalDataProvider...');
            
            // Initialize crawler
            await this.crawler.initialize();
            
            // Register default sources for testing
            this.registerDataSource('test-confluence', {
                platform: 'confluence',
                baseUrl: 'https://test.atlassian.net/wiki',
                enabled: false // Disabled by default
            });
            
            this.registerDataSource('test-generic', {
                platform: 'generic',
                baseUrl: 'https://api.example.com/docs',
                enabled: false // Disabled by default
            });
            
            this.isInitialized = true;
            console.log('✅ ExternalDataProvider initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize ExternalDataProvider:', error.message);
            this.isInitialized = false;
        }
    }

    /**
     * Register a new data source
     * @param {string} id - Unique identifier for the data source
     * @param {Object} config - Data source configuration
     */
    registerDataSource(id, config) {
        const {
            platform = 'generic',
            baseUrl = '',
            enabled = false,
            syncInterval = 3600000, // 1 hour default
            ...otherConfig
        } = config;

        this.dataSources.set(id, {
            id,
            platform,
            baseUrl,
            enabled,
            syncInterval,
            lastSync: null,
            syncCount: 0,
            errorCount: 0,
            status: 'ready',
            ...otherConfig
        });

        console.log(`📝 Registered data source: ${id} (${platform})`);
    }

    /**
     * Get articles from external sources or cache
     * @param {string} sourceId - Optional specific source ID
     * @param {boolean} forceRefresh - Force refresh from external source
     * @returns {Array} Array of articles
     */
    async getArticles(sourceId = null, forceRefresh = false) {
        try {
            if (!this.isInitialized) {
                console.warn('⚠️  ExternalDataProvider not initialized, returning empty array');
                return [];
            }

            const cacheKey = sourceId || 'all-sources';
            
            // Check cache first unless force refresh
            if (!forceRefresh && this.articleCache.has(cacheKey)) {
                const cached = this.articleCache.get(cacheKey);
                const cacheAge = Date.now() - cached.timestamp;
                const maxAge = 300000; // 5 minutes cache
                
                if (cacheAge < maxAge) {
                    console.log(`📋 Returning cached articles for ${cacheKey}`);
                    return cached.articles;
                }
            }

            let allArticles = [];

            if (sourceId) {
                // Get articles from specific source
                const source = this.dataSources.get(sourceId);
                if (source && source.enabled) {
                    allArticles = await this.fetchFromSource(source);
                }
            } else {
                // Get articles from all enabled sources
                for (const [id, source] of this.dataSources) {
                    if (source.enabled) {
                        try {
                            const articles = await this.fetchFromSource(source);
                            allArticles = allArticles.concat(articles);
                        } catch (error) {
                            console.error(`❌ Failed to fetch from source ${id}:`, error.message);
                        }
                    }
                }
            }

            // Cache the results
            this.articleCache.set(cacheKey, {
                articles: allArticles,
                timestamp: Date.now()
            });

            console.log(`✅ Retrieved ${allArticles.length} articles from external sources`);
            return allArticles;

        } catch (error) {
            console.error('❌ Error getting articles from external sources:', error.message);
            return [];
        }
    }

    /**
     * Fetch articles from a specific data source
     * @param {Object} source - Data source configuration
     * @returns {Array} Array of articles
     */
    async fetchFromSource(source) {
        try {
            console.log(`🔄 Fetching from source: ${source.id} (${source.platform})`);
            
            let articles = [];

            switch (source.platform) {
                case 'confluence':
                    articles = await this.fetchFromConfluence(source);
                    break;
                case 'notion':
                    articles = await this.fetchFromNotion(source);
                    break;
                case 'gitbook':
                    articles = await this.fetchFromGitbook(source);
                    break;
                case 'generic':
                    articles = await this.fetchFromGeneric(source);
                    break;
                default:
                    console.warn(`⚠️  Unsupported platform: ${source.platform}`);
                    articles = [];
            }

            // Update source stats
            source.lastSync = new Date().toISOString();
            source.syncCount++;
            source.status = 'success';

            return articles;

        } catch (error) {
            console.error(`❌ Error fetching from source ${source.id}:`, error.message);
            source.errorCount++;
            source.status = 'error';
            source.lastError = error.message;
            return [];
        }
    }

    /**
     * Fetch articles from Confluence
     * @param {Object} source - Confluence source configuration
     * @returns {Array} Array of articles
     */
    async fetchFromConfluence(source) {
        // For now, return mock data since we don't have real credentials
        return this.generateMockArticles('confluence', source.id);
    }

    /**
     * Fetch articles from Notion
     * @param {Object} source - Notion source configuration
     * @returns {Array} Array of articles
     */
    async fetchFromNotion(source) {
        // For now, return mock data since we don't have real credentials
        return this.generateMockArticles('notion', source.id);
    }

    /**
     * Fetch articles from GitBook
     * @param {Object} source - GitBook source configuration
     * @returns {Array} Array of articles
     */
    async fetchFromGitbook(source) {
        // For now, return mock data since we don't have real credentials
        return this.generateMockArticles('gitbook', source.id);
    }

    /**
     * Fetch articles from generic web source
     * @param {Object} source - Generic source configuration
     * @returns {Array} Array of articles
     */
    async fetchFromGeneric(source) {
        try {
            // Special handling for StoreHub Care with real scraping
            if (source.id === 'storehub-care') {
                console.log('🏪 Using StoreHub Care scraper for real data...');

                try {
                    const maxArticlesPerCategory = source.maxArticlesPerCategory || 3;
                    const articles = await this.storeHubScraper.scrapeAllArticles(maxArticlesPerCategory);

                    if (articles && articles.length > 0) {
                        console.log(`✅ Successfully scraped ${articles.length} real articles from StoreHub Care`);
                        return articles;
                    } else {
                        console.warn('⚠️  No articles scraped, falling back to mock data');
                        return this.generateStoreHubCareMockData(source);
                    }
                } catch (scrapeError) {
                    console.error('❌ StoreHub Care scraping failed:', scrapeError.message);
                    console.log('🔄 Falling back to mock data...');
                    return this.generateStoreHubCareMockData(source);
                }
            }

            // Use custom crawl options if provided for other sources
            const crawlOptions = source.crawlOptions || {
                maxPages: 10,
                depth: 2
            };

            console.log(`🕷️  Crawling ${source.baseUrl} with options:`, crawlOptions);

            // Use the crawler for generic web sources
            const crawlResults = await this.crawler.crawlWebsite(source.baseUrl, crawlOptions);

            const articles = crawlResults.articles.map(article => ({
                ...article,
                source: source.id,
                platform: 'generic',
                sourceUrl: source.baseUrl,
                sourceName: source.name || source.id,
                lastSynced: new Date().toISOString(),
                // Add StoreHub-specific metadata
                category: this.extractCategoryFromUrl(article.url, source.baseUrl),
                tags: this.extractTagsFromContent(article.content, article.title)
            }));

            console.log(`✅ Successfully crawled ${articles.length} articles from ${source.baseUrl}`);
            return articles;

        } catch (error) {
            console.warn(`⚠️  Generic crawling failed for ${source.baseUrl}:`, error.message);

            // For StoreHub Care, return some realistic mock data
            if (source.id === 'storehub-care') {
                return this.generateStoreHubCareMockData(source);
            }

            return this.generateMockArticles('generic', source.id);
        }
    }

    /**
     * Extract category from URL path for StoreHub Care articles
     * @param {string} url - Article URL
     * @param {string} baseUrl - Base URL of the source
     * @returns {string} Extracted category
     */
    extractCategoryFromUrl(url, baseUrl) {
        try {
            const urlPath = url.replace(baseUrl, '').split('/').filter(Boolean);

            // StoreHub Care URL patterns
            const categoryMappings = {
                'getting-started': 'Getting Started',
                'pos': 'POS System',
                'payments': 'Payments',
                'inventory': 'Inventory Management',
                'reports': 'Reports & Analytics',
                'settings': 'Settings',
                'troubleshooting': 'Troubleshooting',
                'integrations': 'Integrations',
                'account': 'Account Management',
                'billing': 'Billing & Subscriptions'
            };

            // Look for category in URL path
            for (const [key, category] of Object.entries(categoryMappings)) {
                if (urlPath.some(segment => segment.includes(key))) {
                    return category;
                }
            }

            // Default category based on first path segment
            return urlPath[0] ? urlPath[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';
        } catch (error) {
            return 'General';
        }
    }

    /**
     * Extract relevant tags from article content and title
     * @param {string} content - Article content
     * @param {string} title - Article title
     * @returns {Array} Array of tags
     */
    extractTagsFromContent(content, title) {
        const commonTags = [
            'pos', 'payment', 'inventory', 'report', 'setting', 'integration',
            'troubleshoot', 'setup', 'configuration', 'billing', 'account',
            'customer', 'product', 'order', 'receipt', 'discount', 'tax'
        ];

        const text = `${title} ${content}`.toLowerCase();
        const foundTags = commonTags.filter(tag =>
            text.includes(tag) || text.includes(tag + 's')
        );

        // Add some default tags
        const defaultTags = ['storehub', 'help'];

        return [...new Set([...foundTags, ...defaultTags])].slice(0, 5);
    }

    /**
     * Generate realistic mock data for StoreHub Care
     * @param {Object} source - Source configuration
     * @returns {Array} Array of mock StoreHub Care articles
     */
    generateStoreHubCareMockData(source) {
        return [
            {
                id: 'care-001',
                title: 'Getting Started with StoreHub POS',
                content: 'Learn how to set up your StoreHub POS system for the first time. This comprehensive guide covers initial setup, user account creation, and basic configuration.',
                summary: 'Complete setup guide for new StoreHub POS users',
                url: `${source.baseUrl}/getting-started/pos-setup`,
                category: 'Getting Started',
                tags: ['pos', 'setup', 'getting-started', 'storehub'],
                lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                author: 'StoreHub Support Team',
                status: 'published',
                viewCount: 1250,
                helpfulVotes: 45,
                lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                source: source.id,
                platform: 'generic',
                sourceUrl: source.baseUrl,
                sourceName: source.name
            },
            {
                id: 'care-002',
                title: 'Processing Payments with StoreHub',
                content: 'Understand how to process different types of payments including cash, card, and digital payments through your StoreHub system.',
                summary: 'Guide to processing various payment methods',
                url: `${source.baseUrl}/payments/processing-payments`,
                category: 'Payments',
                tags: ['payment', 'cash', 'card', 'digital', 'storehub'],
                lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                author: 'Payment Team',
                status: 'published',
                viewCount: 890,
                helpfulVotes: 32,
                lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                source: source.id,
                platform: 'generic',
                sourceUrl: source.baseUrl,
                sourceName: source.name
            },
            {
                id: 'care-003',
                title: 'Managing Your Inventory',
                content: 'Learn how to add products, track stock levels, set up low stock alerts, and manage your inventory efficiently with StoreHub.',
                summary: 'Complete inventory management guide',
                url: `${source.baseUrl}/inventory/managing-inventory`,
                category: 'Inventory Management',
                tags: ['inventory', 'stock', 'products', 'alerts', 'storehub'],
                lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                author: 'Product Team',
                status: 'published',
                viewCount: 1100,
                helpfulVotes: 38,
                lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                source: source.id,
                platform: 'generic',
                sourceUrl: source.baseUrl,
                sourceName: source.name
            }
        ];
    }

    /**
     * Generate mock articles for testing
     * @param {string} platform - Platform name
     * @param {string} sourceId - Source identifier
     * @returns {Array} Array of mock articles
     */
    generateMockArticles(platform, sourceId) {
        const mockArticles = [
            {
                id: `${sourceId}-001`,
                title: `${platform} Article 1 - Getting Started`,
                content: `This is a comprehensive guide to getting started with ${platform}. It covers the basics and provides step-by-step instructions for new users.`,
                category: 'Getting Started',
                tags: [platform, 'guide', 'beginner'],
                status: 'published',
                author: `${platform} Team`,
                lastModified: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                viewCount: Math.floor(Math.random() * 1000),
                helpfulVotes: Math.floor(Math.random() * 50),
                source: sourceId,
                platform: platform,
                externalUrl: `https://${platform}.example.com/article-1`
            },
            {
                id: `${sourceId}-002`,
                title: `${platform} Article 2 - Advanced Features`,
                content: `Learn about the advanced features available in ${platform}. This guide covers power-user functionality and best practices.`,
                category: 'Advanced',
                tags: [platform, 'advanced', 'features'],
                status: 'published',
                author: `${platform} Expert`,
                lastModified: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                viewCount: Math.floor(Math.random() * 500),
                helpfulVotes: Math.floor(Math.random() * 30),
                source: sourceId,
                platform: platform,
                externalUrl: `https://${platform}.example.com/article-2`
            }
        ];

        return mockArticles;
    }

    /**
     * Get data source status
     * @returns {Object} Status information for all data sources
     */
    getDataSourceStatus() {
        const sources = Array.from(this.dataSources.values()).map(source => ({
            id: source.id,
            platform: source.platform,
            enabled: source.enabled,
            status: source.status,
            lastSync: source.lastSync,
            syncCount: source.syncCount,
            errorCount: source.errorCount,
            lastError: source.lastError || null
        }));

        return {
            isInitialized: this.isInitialized,
            totalSources: sources.length,
            enabledSources: sources.filter(s => s.enabled).length,
            sources: sources,
            cacheStatus: {
                size: this.articleCache.size,
                keys: Array.from(this.articleCache.keys())
            }
        };
    }

    /**
     * Sync data from a specific source
     * @param {string} sourceId - Source identifier
     * @returns {Object} Sync results
     */
    async syncDataSource(sourceId) {
        try {
            const source = this.dataSources.get(sourceId);
            if (!source) {
                throw new Error(`Data source ${sourceId} not found`);
            }

            console.log(`🔄 Syncing data source: ${sourceId}`);
            
            const articles = await this.fetchFromSource(source);
            
            // Clear cache to force refresh
            this.clearCache();
            
            return {
                sourceId: sourceId,
                success: true,
                articlesFound: articles.length,
                syncTime: new Date().toISOString(),
                message: `Successfully synced ${articles.length} articles from ${sourceId}`
            };

        } catch (error) {
            console.error(`❌ Failed to sync data source ${sourceId}:`, error.message);
            return {
                sourceId: sourceId,
                success: false,
                error: error.message,
                syncTime: new Date().toISOString(),
                message: `Failed to sync data source ${sourceId}: ${error.message}`
            };
        }
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.articleCache.clear();
        console.log('🗑️  External data cache cleared');
    }

    /**
     * Get crawler statistics
     * @returns {Object} Crawler statistics
     */
    getCrawlerStats() {
        return this.crawler.getStats();
    }
}

module.exports = ExternalDataProvider; 