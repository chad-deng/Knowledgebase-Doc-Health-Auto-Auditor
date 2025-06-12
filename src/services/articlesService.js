const { ValidationError, ServiceError } = require('../middleware/errorHandling/errors');
const ExternalDataProvider = require('./ExternalDataProvider');

/**
 * Articles Service - Manages knowledge base articles with live data integration
 * Provides CRUD operations for knowledge base content from external sources
 */
class ArticlesService {
  constructor() {
    this.articles = this.generateMockArticles();
    this.externalDataProvider = new ExternalDataProvider();
    this.useLiveData = true; // Enable live data by default to use StoreHub Care
    this.initializeExternalSources();
  }

  /**
   * Initialize external data sources
   */
  async initializeExternalSources() {
    try {
      await this.externalDataProvider.initialize();
      
      // Register StoreHub Care as primary article source with real scraping
      this.externalDataProvider.registerDataSource('storehub-care', {
        platform: 'generic',
        enabled: true, // Enable by default
        baseUrl: 'https://care.storehub.com/en',
        name: 'StoreHub Care Center',
        description: 'Official StoreHub customer support and knowledge base',
        maxArticlesPerCategory: 4, // Scrape 4 articles per category
        crawlOptions: {
          maxPages: 50,
          depth: 3,
          waitForSelector: 'article, .content, .help-article',
          extractImages: false,
          extractLinks: true,
          timeout: 30000
        },
        syncInterval: 3600000, // Sync every hour
        priority: 'high',
        useRealScraping: true // Flag to indicate real scraping should be used
      });

      // Example: Register additional external sources (these would be configurable)
      // Uncomment and configure these when you have real credentials

      /*
      // Confluence example
      this.externalDataProvider.registerDataSource('storehub-confluence', {
        platform: 'confluence',
        enabled: false, // Set to true when configured
        baseUrl: 'https://your-domain.atlassian.net',
        spaceKey: 'KB',
        username: 'your-email@domain.com',
        apiToken: 'your-api-token'
      });

      // GitBook example
      this.externalDataProvider.registerDataSource('storehub-gitbook', {
        platform: 'gitbook',
        enabled: false, // Set to true when configured
        baseUrl: 'https://docs.storehub.com',
        paths: ['/getting-started', '/api-reference', '/troubleshooting']
      });

      // Generic URLs example
      this.externalDataProvider.registerDataSource('help-articles', {
        platform: 'generic',
        enabled: false, // Set to true when configured
        urls: [
          'https://help.storehub.com/getting-started',
          'https://help.storehub.com/payments',
          'https://help.storehub.com/inventory'
        ]
      });
      */

      console.log('🌐 External data sources initialized');
    } catch (error) {
      console.error('❌ Failed to initialize external sources:', error);
      // Continue with mock data
    }
  }

  /**
   * Enable or disable live data integration
   * @param {boolean} enabled - Whether to use live data
   */
  setLiveDataEnabled(enabled) {
    this.useLiveData = enabled;
    console.log(`📡 Live data integration ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Generate realistic mock knowledge base articles
   */
  generateMockArticles() {
    const mockArticles = [
      {
        id: "article-001",
        title: "Getting Started with StoreHub POS System",
        content: `# Getting Started with StoreHub POS System

Welcome to StoreHub! This guide will help you set up your point-of-sale system quickly.

## Initial Setup

1. **Account Creation**: Create your StoreHub account at https://storehub.com/signup
2. **Device Registration**: Register your iPad or Android tablet
3. **Payment Gateway**: Connect your preferred payment processor
4. **Inventory Setup**: Add your products and categories

## First Sale

To process your first sale:
1. Open the StoreHub app
2. Add items to the cart by tapping products
3. Apply discounts if needed
4. Choose payment method
5. Complete the transaction

## Support

Need help? Contact our 24/7 support team at support@storehub.com`,
        lastModified: "2024-03-15T10:30:00Z",
        author: "StoreHub Support Team",
        category: "Getting Started",
        tags: ["setup", "pos", "getting-started", "tutorial"],
        status: "published",
        viewCount: 1250,
        helpfulVotes: 45,
        lastReviewed: "2024-03-15T10:30:00Z"
      },
      {
        id: "article-002", 
        title: "Managing Inventory and Stock Levels",
        content: `# Managing Inventory and Stock Levels

Effective inventory management is crucial for retail success. StoreHub provides comprehensive tools to track and manage your stock.

## Stock Tracking

### Adding Products
- Navigate to Inventory → Products
- Click "Add New Product"
- Enter product details (name, SKU, price, category)
- Set initial stock quantity

### Stock Alerts
Configure low stock alerts to prevent stockouts:
1. Go to Settings → Inventory
2. Set minimum stock thresholds
3. Enable email notifications
4. Review alerts daily

## Stock Adjustments

### Manual Adjustments
When you need to adjust stock manually:
- Find the product in inventory
- Click "Adjust Stock"
- Enter reason for adjustment
- Confirm the change

### Bulk Updates
For multiple products:
1. Export current inventory to CSV
2. Update quantities in spreadsheet
3. Import the updated file
4. Review changes before confirming

## Reporting

Generate inventory reports to analyze:
- Stock movement trends
- Fast/slow-moving items
- Reorder recommendations
- Stock valuation

Regular inventory audits help maintain accuracy and profitability.`,
        lastModified: "2024-02-20T14:45:00Z",
        author: "Sarah Chen",
        category: "Inventory Management",
        tags: ["inventory", "stock", "management", "alerts"],
        status: "published",
        viewCount: 892,
        helpfulVotes: 32,
        lastReviewed: "2024-02-20T14:45:00Z"
      },
      {
        id: "article-003",
        title: "Troubleshooting Payment Processing Issues",
        content: `# Troubleshooting Payment Processing Issues

Payment processing problems can disrupt sales. Here's how to diagnose and resolve common issues.

## Common Payment Issues

### Card Declined
**Symptoms**: Transaction fails with "Card Declined" message
**Solutions**:
1. Ask customer to try another card
2. Check if card reader is properly connected
3. Verify internet connection
4. Retry the transaction

### Connection Timeout
**Symptoms**: Payment hangs or times out
**Solutions**:
1. Check internet connectivity
2. Restart the payment terminal
3. Switch to offline mode temporarily
4. Contact payment processor if persistent

### Terminal Not Responding
**Symptoms**: Payment terminal screen frozen or unresponsive
**Solutions**:
1. Unplug terminal for 30 seconds
2. Reconnect all cables
3. Restart the StoreHub app
4. Test with a small transaction

## Prevention Tips

- Keep payment terminals updated
- Maintain stable internet connection
- Regular cleaning of card readers
- Monitor transaction success rates
- Have backup payment methods ready

For persistent issues, contact StoreHub support with:
- Error messages received
- Time of occurrence  
- Transaction amount
- Payment method used`,
        lastModified: "2023-11-10T09:15:00Z",
        author: "Mike Rodriguez",
        category: "Troubleshooting",
        tags: ["payment", "troubleshooting", "card-reader", "issues"],
        status: "published",
        viewCount: 654,
        helpfulVotes: 28,
        lastReviewed: "2023-11-10T09:15:00Z"
      },
      {
        id: "article-004",
        title: "StoreHub API Integration Guide",
        content: `# StoreHub API Integration Guide

Integrate StoreHub with your existing systems using our RESTful API.

## Authentication

All API requests require authentication using API keys:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.storehub.com/v1/products
\`\`\`

## Endpoints

### Products
- \`GET /v1/products\` - List all products
- \`GET /v1/products/{id}\` - Get product details
- \`POST /v1/products\` - Create new product
- \`PUT /v1/products/{id}\` - Update product
- \`DELETE /v1/products/{id}\` - Delete product

### Sales
- \`GET /v1/sales\` - List sales transactions
- \`POST /v1/sales\` - Create new sale
- \`GET /v1/sales/{id}\` - Get sale details

### Inventory
- \`GET /v1/inventory\` - Get inventory levels
- \`POST /v1/inventory/adjust\` - Adjust stock levels

## Rate Limits

API calls are limited to:
- 1000 requests per hour for standard plans
- 5000 requests per hour for premium plans

## Error Handling

The API returns standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized  
- 404: Not Found
- 429: Rate Limit Exceeded
- 500: Internal Server Error

Example error response:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product name is required",
    "details": {
      "field": "name",
      "constraint": "required"
    }
  }
}
\`\`\`

## SDK Libraries

Official SDKs available for:
- JavaScript/Node.js
- Python
- PHP
- Ruby
- C#/.NET

Visit our developer portal for documentation and examples.`,
        lastModified: "2024-01-08T16:20:00Z",
        author: "Dev Team",
        category: "API Documentation",
        tags: ["api", "integration", "development", "sdk"],
        status: "published",
        viewCount: 423,
        helpfulVotes: 15,
        lastReviewed: "2024-01-08T16:20:00Z"
      },
      {
        id: "article-005",
        title: "Setting Up Customer Loyalty Programs",
        content: `# Setting Up Customer Loyalty Programs

Boost customer retention with StoreHub's built-in loyalty program features.

## Program Types

### Points-Based System
Customers earn points for every purchase:
1. Go to Marketing → Loyalty Programs
2. Click "Create New Program"
3. Select "Points-Based"
4. Set points per dollar spent
5. Define redemption tiers

### Tier-Based System  
Customers unlock benefits based on spending:
- Bronze: 0-$500 annually
- Silver: $500-$1500 annually  
- Gold: $1500+ annually

## Configuration Steps

### Basic Setup
1. Enable loyalty in Settings
2. Choose program type
3. Set earning rules
4. Configure rewards
5. Design member cards

### Advanced Features
- Birthday bonuses
- Referral rewards
- Bonus point events
- Tier upgrade notifications
- Expired points handling

## Customer Enrollment

### Automatic Enrollment
- Enable auto-signup at checkout
- Collect email/phone number
- Send welcome message
- Issue digital membership card

### Manual Enrollment  
Staff can enroll customers:
1. Search customer database
2. Create new customer profile
3. Enroll in loyalty program
4. Explain program benefits

## Tracking and Analytics

Monitor program performance:
- Member acquisition rate
- Point redemption patterns
- Program ROI
- Customer lifetime value
- Engagement metrics

Regular analysis helps optimize rewards and increase participation.`,
        lastModified: "2023-12-05T11:30:00Z",
        author: "Marketing Team",
        category: "Marketing",
        tags: ["loyalty", "customers", "retention", "marketing"],
        status: "published",
        viewCount: 567,
        helpfulVotes: 22,
        lastReviewed: "2023-12-05T11:30:00Z"
      },
      {
        id: "article-006",
        title: "Understanding Sales Reports and Analytics",
        content: `# Understanding Sales Reports and Analytics

Make data-driven decisions with StoreHub's comprehensive reporting suite.

## Key Metrics

### Revenue Metrics
- Gross Sales: Total sales before discounts/returns
- Net Sales: Sales after discounts and returns
- Average Transaction Value (ATV)
- Revenue per customer
- Year-over-year growth

### Performance Indicators
- Conversion rate
- Items per transaction
- Customer retention rate
- Inventory turnover
- Profit margins

## Report Types

### Daily Summary
Quick overview of daily performance:
- Total sales
- Transaction count
- Top-selling products
- Payment method breakdown
- Staff performance

### Product Performance
Analyze individual product success:
- Sales by product
- Profit margins
- Inventory movement
- Seasonal trends
- Price optimization opportunities

### Customer Analytics
Understand your customer base:
- New vs returning customers
- Customer lifetime value
- Purchase frequency
- Demographic insights
- Loyalty program participation

## Custom Reports

Create tailored reports:
1. Go to Reports → Custom Reports
2. Select data fields
3. Set date ranges
4. Apply filters
5. Schedule automated delivery

## Exporting Data

Export options available:
- PDF for presentations
- CSV for spreadsheet analysis
- Excel with formatting
- API for system integration

## Best Practices

- Review reports weekly
- Track trends over time
- Compare to industry benchmarks
- Act on insights quickly
- Share with relevant team members

Data-driven decisions lead to better business outcomes.`,
        lastModified: "2023-10-18T13:45:00Z",
        author: "Analytics Team",
        category: "Reports & Analytics", 
        tags: ["reports", "analytics", "metrics", "data"],
        status: "published",
        viewCount: 789,
        helpfulVotes: 35,
        lastReviewed: "2023-10-18T13:45:00Z"
      }
    ];

    return mockArticles;
  }

  /**
   * Get all articles with optional filtering and external data integration
   */
  async getArticles(options = {}) {
    try {
      const { category, status, tags, search, limit, offset, sortBy, sortOrder, forceRefresh = false } = options;
      
      let allArticles = [];

      // Use external data if enabled, otherwise fall back to mock data
      if (this.useLiveData) {
        try {
          console.log('📡 Fetching live data from external sources...');
          allArticles = await this.externalDataProvider.getArticles(null, forceRefresh);
          console.log(`✅ Retrieved ${allArticles.length} articles from external sources`);
        } catch (error) {
          console.warn('⚠️  External data fetch failed, falling back to mock data:', error.message);
          allArticles = [...this.articles];
        }
      } else {
        allArticles = [...this.articles];
      }

      let filteredArticles = allArticles;

      // Apply filters
      if (category) {
        filteredArticles = filteredArticles.filter(
          article => article.category && article.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (status) {
        filteredArticles = filteredArticles.filter(
          article => article.status === status || (status === 'published' && !article.status)
        );
      }

      if (tags) {
        const tagList = Array.isArray(tags) ? tags : [tags];
        filteredArticles = filteredArticles.filter(
          article => article.tags && tagList.some(tag => 
            article.tags.some(articleTag => 
              articleTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredArticles = filteredArticles.filter(
          article => 
            (article.title && article.title.toLowerCase().includes(searchLower)) ||
            (article.content && article.content.toLowerCase().includes(searchLower)) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }

      // Apply sorting
      if (sortBy) {
        filteredArticles.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];

          // Handle missing values
          if (!aValue) aValue = sortBy === 'lastModified' ? '1970-01-01' : '';
          if (!bValue) bValue = sortBy === 'lastModified' ? '1970-01-01' : '';

          // Handle date sorting
          if (sortBy === 'lastModified' || sortBy === 'lastReviewed') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
          }

          // Handle string sorting
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      // Apply pagination
      const total = filteredArticles.length;
      const offsetNum = parseInt(offset) || 0;
      const limitNum = parseInt(limit) || total;
      
      const paginatedArticles = filteredArticles.slice(offsetNum, offsetNum + limitNum);

      return {
        articles: paginatedArticles,
        pagination: {
          total,
          offset: offsetNum,
          limit: limitNum,
          hasMore: offsetNum + limitNum < total
        },
        dataSource: this.useLiveData ? 'external' : 'mock'
      };
    } catch (error) {
      throw ServiceError.articles('getArticles', 'Failed to retrieve articles', error);
    }
  }

  /**
   * Get a single article by ID
   */
  async getArticle(id) {
    try {
      if (!id) {
        throw ValidationError.required('id');
      }

      if (typeof id !== 'string' || id.trim().length === 0) {
        throw ValidationError.invalidFormat('id', id);
      }

      const article = this.articles.find(article => article.id === id);
      
      if (!article) {
        throw new ValidationError(
          `Article with ID '${id}' not found`,
          'id',
          id,
          { exists: false }
        );
      }

      return article;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw ServiceError.articles('getArticle', `Failed to retrieve article ${id}`, error);
    }
  }

  /**
   * Get article categories with count
   */
  async getCategories() {
    try {
      const categories = {};
      
      this.articles.forEach(article => {
        if (article.status === 'published') {
          const category = article.category;
          categories[category] = (categories[category] || 0) + 1;
        }
      });

      return Object.entries(categories).map(([name, count]) => ({
        name,
        count,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));
    } catch (error) {
      throw ServiceError.articles('getCategories', 'Failed to retrieve categories', error);
    }
  }

  /**
   * Get all tags with usage count
   */
  async getTags() {
    try {
      const tags = {};
      
      this.articles.forEach(article => {
        if (article.status === 'published') {
          article.tags.forEach(tag => {
            tags[tag] = (tags[tag] || 0) + 1;
          });
        }
      });

      return Object.entries(tags)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      throw ServiceError.articles('getTags', 'Failed to retrieve tags', error);
    }
  }

  /**
   * Search articles with fuzzy matching
   */
  async searchArticles(query, options = {}) {
    try {
      if (!query || query.trim().length === 0) {
        throw ValidationError.required('query');
      }

      const searchOptions = {
        ...options,
        search: query.trim()
      };

      return await this.getArticles(searchOptions);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw ServiceError.articles('searchArticles', 'Failed to search articles', error);
    }
  }

  /**
   * Get article statistics
   */
  async getStatistics() {
    try {
      const stats = {
        totalArticles: this.articles.length,
        publishedArticles: this.articles.filter(a => a.status === 'published').length,
        totalViews: this.articles.reduce((sum, a) => sum + a.viewCount, 0),
        totalHelpfulVotes: this.articles.reduce((sum, a) => sum + a.helpfulVotes, 0),
        categoriesCount: new Set(this.articles.map(a => a.category)).size,
        tagsCount: new Set(this.articles.flatMap(a => a.tags)).size,
        averageViewsPerArticle: 0,
        mostViewedArticle: null,
        newestArticle: null,
        oldestArticle: null
      };

      // Calculate averages
      if (stats.publishedArticles > 0) {
        stats.averageViewsPerArticle = Math.round(stats.totalViews / stats.publishedArticles);
      }

      // Find most viewed article
      stats.mostViewedArticle = this.articles.reduce((prev, current) => 
        (prev.viewCount > current.viewCount) ? prev : current
      );

      // Find newest and oldest articles
      const sortedByDate = [...this.articles].sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
      );
      stats.newestArticle = sortedByDate[0];
      stats.oldestArticle = sortedByDate[sortedByDate.length - 1];

      return stats;
    } catch (error) {
      throw ServiceError.articles('getStatistics', 'Failed to retrieve statistics', error);
    }
  }

  /**
   * Get data source status and management
   * @returns {Object} Data source information
   */
  async getDataSourceStatus() {
    try {
      return this.externalDataProvider.getDataSourceStatus();
    } catch (error) {
      throw ServiceError.articles('getDataSourceStatus', 'Failed to get data source status', error);
    }
  }

  /**
   * Sync articles from external data sources
   * @param {string} sourceId - Optional specific source ID
   * @returns {Object} Sync results
   */
  async syncExternalSources(sourceId = null) {
    try {
      if (sourceId) {
        return await this.externalDataProvider.syncDataSource(sourceId);
      } else {
        // Sync all sources
        const status = await this.getDataSourceStatus();
        const results = [];
        
        for (const source of status.sources) {
          if (source.enabled) {
            try {
              const result = await this.externalDataProvider.syncDataSource(source.id);
              results.push(result);
            } catch (error) {
              results.push({
                sourceId: source.id,
                success: false,
                error: error.message,
                syncTime: new Date().toISOString()
              });
            }
          }
        }
        
        return {
          totalSources: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        };
      }
    } catch (error) {
      throw ServiceError.articles('syncExternalSources', 'Failed to sync external sources', error);
    }
  }

  /**
   * Register a new external data source
   * @param {string} id - Source identifier
   * @param {Object} config - Source configuration
   */
  async registerDataSource(id, config) {
    try {
      this.externalDataProvider.registerDataSource(id, config);
      return { success: true, sourceId: id };
    } catch (error) {
      throw ServiceError.articles('registerDataSource', 'Failed to register data source', error);
    }
  }

  /**
   * Test connection to an external data source
   * @param {Object} config - Data source configuration
   * @returns {Object} Test results
   */
  async testDataSourceConnection(config) {
    try {
      const { platform } = config;
      
      // Create a temporary test source
      const testId = `test-${Date.now()}`;
      this.externalDataProvider.registerDataSource(testId, { 
        ...config, 
        enabled: true 
      });
      
      try {
        // Try to fetch a small sample
        const articles = await this.externalDataProvider.getArticles(testId, true);
        
        return {
          success: true,
          platform,
          articlesFound: articles.length,
          testTime: new Date().toISOString(),
          message: `Successfully connected to ${platform}. Found ${articles.length} articles.`
        };
      } finally {
        // Clean up test source
        this.externalDataProvider.dataSources.delete(testId);
      }
    } catch (error) {
      return {
        success: false,
        platform: config.platform,
        error: error.message,
        testTime: new Date().toISOString(),
        message: `Failed to connect to ${config.platform}: ${error.message}`
      };
    }
  }

  /**
   * Clear external data cache
   */
  async clearExternalCache() {
    try {
      this.externalDataProvider.clearCache();
      return { success: true, message: 'External data cache cleared' };
    } catch (error) {
      throw ServiceError.articles('clearExternalCache', 'Failed to clear external cache', error);
    }
  }

  /**
   * Get crawler statistics
   */
  async getCrawlerStats() {
    try {
      return this.externalDataProvider.crawler.getStats();
    } catch (error) {
      throw ServiceError.articles('getCrawlerStats', 'Failed to get crawler statistics', error);
    }
  }

  /**
   * Enable a specific data source
   * @param {string} sourceId - Data source identifier
   * @returns {Object} Enable result
   */
  async enableDataSource(sourceId) {
    try {
      const provider = this.externalDataProvider;
      const source = provider.dataSources.get(sourceId);
      
      if (!source) {
        throw new Error(`Data source ${sourceId} not found`);
      }
      
      source.enabled = true;
      console.log(`✅ Enabled data source: ${sourceId}`);
      
      return {
        sourceId: sourceId,
        enabled: true,
        message: `Data source ${sourceId} has been enabled`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw ServiceError.articles('enableDataSource', `Failed to enable data source ${sourceId}`, error);
    }
  }

  /**
   * Disable a specific data source
   * @param {string} sourceId - Data source identifier
   * @returns {Object} Disable result
   */
  async disableDataSource(sourceId) {
    try {
      const provider = this.externalDataProvider;
      const source = provider.dataSources.get(sourceId);
      
      if (!source) {
        throw new Error(`Data source ${sourceId} not found`);
      }
      
      source.enabled = false;
      console.log(`⏸️  Disabled data source: ${sourceId}`);
      
      return {
        sourceId: sourceId,
        enabled: false,
        message: `Data source ${sourceId} has been disabled`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw ServiceError.articles('disableDataSource', `Failed to disable data source ${sourceId}`, error);
    }
  }
}

module.exports = ArticlesService; 