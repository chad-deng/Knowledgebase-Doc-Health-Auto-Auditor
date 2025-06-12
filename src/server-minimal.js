const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple articles endpoint
app.get('/api/articles', (req, res) => {
  const mockArticles = [
    {
      id: "article-001",
      title: "Getting Started with StoreHub POS System",
      content: "This is a sample article about getting started with the StoreHub POS system. Learn the basics of setting up your point of sale system, configuring products, and processing your first transactions.",
      summary: "Learn the basics of setting up your point of sale system and processing transactions.",
      category: "Getting Started",
      status: "published",
      lastModified: "2023-12-01T10:30:00Z",
      author: "StoreHub Support Team",
      tags: ["getting-started", "pos", "setup", "basics"],
      viewCount: 1250,
      helpfulVotes: 45,
      lastReviewed: "2023-12-01T10:30:00Z",
      source: "local"
    },
    {
      id: "article-002",
      title: "Managing Inventory and Stock Levels",
      content: "This is a sample article about inventory management. Discover how to effectively track stock levels, set up low stock alerts, and manage product variants in your StoreHub system.",
      summary: "Discover how to effectively track stock levels and manage product variants.",
      category: "Inventory Management",
      status: "published",
      lastModified: "2023-11-28T14:15:00Z",
      author: "Product Team",
      tags: ["inventory", "stock", "management", "alerts"],
      viewCount: 890,
      helpfulVotes: 32,
      lastReviewed: "2023-11-28T14:15:00Z",
      source: "local"
    },
    // Articles from StoreHub Care Center
    {
      id: "care-001",
      title: "Getting Started with StoreHub POS",
      content: "Learn how to set up your StoreHub POS system for the first time. This comprehensive guide covers initial setup, user account creation, and basic configuration.",
      summary: "Complete setup guide for new StoreHub POS users",
      url: "https://care.storehub.com/en/getting-started/pos-setup",
      category: "Getting Started",
      tags: ["pos", "setup", "getting-started", "storehub"],
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: "StoreHub Support Team",
      status: "published",
      viewCount: 1250,
      helpfulVotes: 45,
      lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      source: "storehub-care",
      sourceUrl: "https://care.storehub.com/en",
      sourceName: "StoreHub Care Center"
    },
    {
      id: "care-002",
      title: "Processing Payments with StoreHub",
      content: "Understand how to process different types of payments including cash, card, and digital payments through your StoreHub system.",
      summary: "Guide to processing various payment methods",
      url: "https://care.storehub.com/en/payments/processing-payments",
      category: "Payments",
      tags: ["payment", "cash", "card", "digital", "storehub"],
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Payment Team",
      status: "published",
      viewCount: 890,
      helpfulVotes: 32,
      lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      source: "storehub-care",
      sourceUrl: "https://care.storehub.com/en",
      sourceName: "StoreHub Care Center"
    },
    {
      id: "care-003",
      title: "Managing Your Inventory",
      content: "Learn how to add products, track stock levels, set up low stock alerts, and manage your inventory efficiently with StoreHub.",
      summary: "Complete inventory management guide",
      url: "https://care.storehub.com/en/inventory/managing-inventory",
      category: "Inventory Management",
      tags: ["inventory", "stock", "products", "alerts", "storehub"],
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Product Team",
      status: "published",
      viewCount: 1100,
      helpfulVotes: 38,
      lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: "storehub-care",
      sourceUrl: "https://care.storehub.com/en",
      sourceName: "StoreHub Care Center"
    }
  ];

  res.json({
    success: true,
    data: {
      articles: mockArticles
    },
    meta: {
      total: mockArticles.length,
      fromSources: {
        local: 2,
        "storehub-care": 8
      },
      requestedAt: new Date().toISOString()
    }
  });
});

// Simple article by ID endpoint
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;

  const articles = [
    {
      id: "article-001",
      title: "Getting Started with StoreHub POS System",
      content: "This is a sample article about getting started with the StoreHub POS system. Learn the basics of setting up your point of sale system, configuring products, and processing your first transactions.",
      summary: "Learn the basics of setting up your point of sale system and processing transactions.",
      category: "Getting Started",
      status: "published",
      lastModified: "2023-12-01T10:30:00Z",
      author: "StoreHub Support Team",
      tags: ["getting-started", "pos", "setup", "basics"],
      viewCount: 1250,
      helpfulVotes: 45,
      lastReviewed: "2023-12-01T10:30:00Z"
    },
    {
      id: "article-002",
      title: "Managing Inventory and Stock Levels",
      content: "This is a sample article about inventory management. Discover how to effectively track stock levels, set up low stock alerts, and manage product variants in your StoreHub system.",
      summary: "Discover how to effectively track stock levels and manage product variants.",
      category: "Inventory Management",
      status: "published",
      lastModified: "2023-11-28T14:15:00Z",
      author: "Product Team",
      tags: ["inventory", "stock", "management", "alerts"],
      viewCount: 890,
      helpfulVotes: 32,
      lastReviewed: "2023-11-28T14:15:00Z"
    }
  ];

  const article = articles.find(a => a.id === id);

  if (!article) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ARTICLE_NOT_FOUND',
        message: `Article '${id}' not found`
      }
    });
  }

  res.json({
    success: true,
    data: {
      article
    },
    meta: {
      requestedAt: new Date().toISOString()
    }
  });
});

// Data sources status endpoint
app.get('/api/ai/data-sources/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      isInitialized: true,
      totalSources: 1,
      enabledSources: 1,
      sources: [
        {
          id: 'storehub-care',
          name: 'StoreHub Care Center',
          platform: 'generic',
          baseUrl: 'https://care.storehub.com/en',
          enabled: true,
          status: 'success',
          lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          syncCount: 5,
          errorCount: 0,
          articlesCount: 8
        }
      ]
    },
    metadata: {
      requestTimestamp: new Date().toISOString()
    }
  });
});

// Data sources sync endpoint
app.post('/api/ai/data-sources/sync', (req, res) => {
  const { sourceId, forceRefresh } = req.body;

  res.json({
    status: 'success',
    data: {
      sourceId: sourceId || 'all',
      success: true,
      articlesFound: 8,
      syncTime: new Date().toISOString(),
      message: `Successfully synced articles from ${sourceId || 'all sources'}`
    },
    metadata: {
      requestTimestamp: new Date().toISOString(),
      syncParameters: { sourceId, forceRefresh }
    }
  });
});

// Enable/disable data source endpoints
app.get('/api/ai/data-sources/enable/:sourceId', (req, res) => {
  const { sourceId } = req.params;

  res.json({
    status: 'success',
    data: {
      sourceId,
      enabled: true,
      message: `Data source ${sourceId} enabled successfully`
    },
    metadata: {
      requestTimestamp: new Date().toISOString()
    }
  });
});

app.get('/api/ai/data-sources/disable/:sourceId', (req, res) => {
  const { sourceId } = req.params;

  res.json({
    status: 'success',
    data: {
      sourceId,
      enabled: false,
      message: `Data source ${sourceId} disabled successfully`
    },
    metadata: {
      requestTimestamp: new Date().toISOString()
    }
  });
});

// StoreHub Care scraping endpoint
app.post('/api/scrape/storehub-care', async (req, res) => {
  try {
    const { maxArticlesPerCategory = 3, forceRefresh = false } = req.body;

    console.log('🏪 Starting StoreHub Care scraping...');

    // Import and use the scraper
    const StoreHubCareScraper = require('./services/StoreHubCareScraper');
    const scraper = new StoreHubCareScraper();

    const startTime = Date.now();
    const articles = await scraper.scrapeAllArticles(maxArticlesPerCategory);
    const endTime = Date.now();

    const scrapingDuration = ((endTime - startTime) / 1000).toFixed(1);

    // Group articles by category
    const categories = [...new Set(articles.map(a => a.category))];

    res.json({
      success: true,
      data: {
        articlesScraped: articles.length,
        categories: categories,
        scrapingTime: new Date().toISOString(),
        scrapingDuration: `${scrapingDuration}s`,
        message: `Successfully scraped ${articles.length} articles from StoreHub Care`,
        articles: articles
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        parameters: { maxArticlesPerCategory, forceRefresh }
      }
    });

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: 'Scraping failed',
        details: error.message
      },
      metadata: {
        requestTimestamp: new Date().toISOString()
      }
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 StoreHub Knowledge Base Auditor Server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 Articles API: http://localhost:${PORT}/api/articles`);
  console.log(`🔍 Article by ID: http://localhost:${PORT}/api/articles/article-001`);
  console.log(`🌐 Data Sources: http://localhost:${PORT}/api/ai/data-sources/status`);
  console.log(`🔄 Sync Sources: POST http://localhost:${PORT}/api/ai/data-sources/sync`);
  console.log(`🏪 Scrape StoreHub Care: POST http://localhost:${PORT}/api/scrape/storehub-care`);
});

module.exports = app; 