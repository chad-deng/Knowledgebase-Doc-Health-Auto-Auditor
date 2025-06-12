const express = require('express');

const router = express.Router();

// Simple mock data
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

/**
 * GET /api/articles
 * Simple list articles endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      articles: mockArticles
    },
    meta: {
      total: mockArticles.length,
      requestedAt: new Date().toISOString()
    }
  });
});

/**
 * GET /api/articles/:id
 * Simple get article by ID endpoint
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const article = mockArticles.find(a => a.id === id);
  
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

module.exports = router; 