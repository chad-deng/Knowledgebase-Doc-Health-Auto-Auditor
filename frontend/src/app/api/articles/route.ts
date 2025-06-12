import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Try to get real data from backend first
    const response = await fetch(`${BACKEND_URL}/api/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching articles from backend, using fallback data:', error);
    
    // Return mock data including StoreHub Care articles if backend is not available
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
      },
      {
        id: "care-004",
        title: "Setting Up Customer Accounts",
        content: "Create and manage customer accounts in StoreHub. Learn how to add customer information, track purchase history, and set up loyalty programs.",
        summary: "Guide to customer account management and loyalty programs",
        url: "https://care.storehub.com/en/customers/account-setup",
        category: "Customer Management",
        tags: ["customers", "accounts", "loyalty", "management", "storehub"],
        lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Customer Success Team",
        status: "published",
        viewCount: 750,
        helpfulVotes: 28,
        lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      },
      {
        id: "care-005",
        title: "Generating Sales Reports",
        content: "Access comprehensive sales reports and analytics in StoreHub. Learn how to generate daily, weekly, and monthly reports to track your business performance.",
        summary: "Complete guide to sales reporting and analytics",
        url: "https://care.storehub.com/en/reports/sales-reports",
        category: "Reports & Analytics",
        tags: ["reports", "analytics", "sales", "performance", "storehub"],
        lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Analytics Team",
        status: "published",
        viewCount: 920,
        helpfulVotes: 41,
        lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      },
      {
        id: "care-006",
        title: "Configuring Tax Settings",
        content: "Set up and manage tax configurations for your business. Learn how to configure different tax rates, exemptions, and compliance requirements.",
        summary: "Tax configuration and compliance guide",
        url: "https://care.storehub.com/en/settings/tax-configuration",
        category: "Settings",
        tags: ["tax", "configuration", "compliance", "settings", "storehub"],
        lastModified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Compliance Team",
        status: "published",
        viewCount: 680,
        helpfulVotes: 25,
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      },
      {
        id: "care-007",
        title: "Troubleshooting Common Issues",
        content: "Resolve common StoreHub POS issues quickly. This guide covers troubleshooting steps for connectivity problems, printing issues, and system errors.",
        summary: "Quick solutions for common POS problems",
        url: "https://care.storehub.com/en/troubleshooting/common-issues",
        category: "Troubleshooting",
        tags: ["troubleshooting", "issues", "problems", "solutions", "storehub"],
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Technical Support Team",
        status: "published",
        viewCount: 1450,
        helpfulVotes: 67,
        lastReviewed: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      },
      {
        id: "care-008",
        title: "Setting Up Discounts and Promotions",
        content: "Create and manage discounts, promotions, and special offers in StoreHub. Learn about percentage discounts, fixed amount discounts, and promotional campaigns.",
        summary: "Guide to creating discounts and promotional campaigns",
        url: "https://care.storehub.com/en/promotions/discounts-setup",
        category: "Promotions",
        tags: ["discounts", "promotions", "offers", "campaigns", "storehub"],
        lastModified: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Marketing Team",
        status: "published",
        viewCount: 830,
        helpfulVotes: 35,
        lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      },
      {
        id: "care-009",
        title: "Integrating with Third-Party Apps",
        content: "Connect StoreHub with popular third-party applications and services. Learn about available integrations for accounting, e-commerce, and marketing tools.",
        summary: "Integration guide for third-party applications",
        url: "https://care.storehub.com/en/integrations/third-party-apps",
        category: "Integrations",
        tags: ["integrations", "third-party", "apps", "connections", "storehub"],
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Integration Team",
        status: "published",
        viewCount: 640,
        helpfulVotes: 22,
        lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      },
      {
        id: "care-010",
        title: "Managing User Permissions",
        content: "Set up and manage user roles and permissions in StoreHub. Learn how to create staff accounts, assign roles, and control access to different features.",
        summary: "User management and permission control guide",
        url: "https://care.storehub.com/en/users/permissions-management",
        category: "User Management",
        tags: ["users", "permissions", "roles", "staff", "storehub"],
        lastModified: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Security Team",
        status: "published",
        viewCount: 560,
        helpfulVotes: 19,
        lastReviewed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        source: "storehub-care",
        sourceUrl: "https://care.storehub.com/en",
        sourceName: "StoreHub Care Center"
      }
    ];

    return NextResponse.json({
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
        requestedAt: new Date().toISOString(),
        fallbackMode: true
      }
    });
  }
}
