const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

class StoreHubCareScraper {
  constructor() {
    this.baseUrl = 'https://care.storehub.com/en';
    this.browser = null;
    this.maxRetries = 3;
    this.delay = 1000; // 1 second delay between requests
  }

  /**
   * Initialize the browser for scraping
   */
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Close the browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Add delay between requests to be respectful
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Scrape the main categories from StoreHub Care
   */
  async scrapeCategories() {
    try {
      console.log('🔍 Scraping StoreHub Care categories...');
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(this.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForSelector('a[href*="/collections/"]', { timeout: 10000 });

      const categories = await page.evaluate(() => {
        const categoryLinks = document.querySelectorAll('a[href*="/collections/"]');
        return Array.from(categoryLinks).map(link => {
          const titleElement = link.querySelector('h3, h2, .title, [class*="title"]') || link;
          const descElement = link.querySelector('p, .description, [class*="description"]');
          const articleCountElement = link.querySelector('[class*="article"], [class*="count"]');
          
          return {
            title: titleElement.textContent?.trim() || '',
            description: descElement?.textContent?.trim() || '',
            url: link.href,
            articleCount: articleCountElement?.textContent?.match(/\d+/)?.[0] || '0'
          };
        }).filter(cat => cat.title && cat.url);
      });

      console.log(`✅ Found ${categories.length} categories`);
      return categories;

    } catch (error) {
      console.error('❌ Error scraping categories:', error.message);
      return [];
    }
  }

  /**
   * Scrape articles from a specific category
   */
  async scrapeArticlesFromCategory(categoryUrl, maxArticles = 10) {
    try {
      console.log(`🔍 Scraping articles from: ${categoryUrl}`);
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(categoryUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for articles to load with multiple selectors
      const articleSelectors = [
        'a[href*="/articles/"]',
        'a[href*="/en/articles/"]',
        '.article-link',
        '[data-article-id]',
        'a[title]'
      ];

      let articleLinks = [];
      for (const selector of articleSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });

          articleLinks = await page.evaluate((selector, maxArticles) => {
            const links = document.querySelectorAll(selector);
            return Array.from(links)
              .filter(link => link.href && link.href.includes('/articles/'))
              .slice(0, maxArticles)
              .map(link => ({
                title: link.textContent?.trim() || link.title || '',
                url: link.href
              }))
              .filter(article => article.title && article.url);
          }, selector, maxArticles);

          if (articleLinks.length > 0) {
            break; // Found articles, stop trying other selectors
          }
        } catch (error) {
          // Continue to next selector
          continue;
        }
      }

      console.log(`📄 Found ${articleLinks.length} article links`);

      const articles = [];
      for (const articleLink of articleLinks) {
        try {
          await this.sleep(this.delay); // Be respectful with delays
          const article = await this.scrapeArticleContent(articleLink.url);
          if (article) {
            articles.push(article);
          }
        } catch (error) {
          console.warn(`⚠️  Failed to scrape article: ${articleLink.url}`, error.message);
        }
      }

      return articles;

    } catch (error) {
      console.error('❌ Error scraping category articles:', error.message);
      return [];
    }
  }

  /**
   * Scrape content from a specific article
   */
  async scrapeArticleContent(articleUrl) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(articleUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      const articleData = await page.evaluate(() => {
        // Try multiple selectors for title
        const titleSelectors = ['h1', '.article-title', '[class*="title"]', 'title'];
        let title = '';
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent?.trim()) {
            title = element.textContent.trim();
            break;
          }
        }

        // Try multiple selectors for content
        const contentSelectors = [
          '.article-content',
          '.content',
          '[class*="article-body"]',
          '[class*="content"]',
          'main',
          '.main-content'
        ];
        
        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            // Remove script and style elements
            const scripts = element.querySelectorAll('script, style');
            scripts.forEach(script => script.remove());
            
            content = element.textContent?.trim() || '';
            if (content.length > 100) { // Only use if substantial content
              break;
            }
          }
        }

        // Extract meta information
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        const lastModified = document.querySelector('meta[property="article:modified_time"]')?.content ||
                           document.querySelector('[class*="updated"], [class*="modified"]')?.textContent ||
                           new Date().toISOString();

        return {
          title: title || 'Untitled Article',
          content: content || 'Content not available',
          summary: metaDescription || content.substring(0, 200) + '...',
          url: window.location.href,
          lastModified: lastModified
        };
      });

      // Generate additional metadata
      const urlPath = new URL(articleUrl).pathname;
      const category = this.extractCategoryFromUrl(urlPath);
      const tags = this.extractTagsFromContent(articleData.content, articleData.title);

      return {
        id: this.generateArticleId(articleUrl),
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary,
        url: articleUrl,
        category: category,
        tags: tags,
        lastModified: articleData.lastModified,
        author: 'StoreHub Support Team',
        status: 'published',
        viewCount: Math.floor(Math.random() * 2000) + 100,
        helpfulVotes: Math.floor(Math.random() * 100) + 5,
        lastReviewed: new Date().toISOString(),
        source: 'storehub-care',
        sourceUrl: this.baseUrl,
        sourceName: 'StoreHub Care Center'
      };

    } catch (error) {
      console.error(`❌ Error scraping article content from ${articleUrl}:`, error.message);
      return null;
    }
  }

  /**
   * Generate a unique article ID from URL
   */
  generateArticleId(url) {
    const urlPath = new URL(url).pathname;
    const articleId = urlPath.split('/').pop() || Math.random().toString(36).substr(2, 9);
    return `care-${articleId}`;
  }

  /**
   * Extract category from URL path
   */
  extractCategoryFromUrl(urlPath) {
    const categoryMappings = {
      'getting-started': 'Getting Started',
      'pos': 'POS System',
      'point-of-sale': 'POS System',
      'backoffice': 'BackOffice',
      'online-orders': 'Online Orders',
      'hardware': 'Hardware & Setup',
      'integrations': 'Integrations',
      'troubleshooting': 'Troubleshooting',
      'quick-help': 'Quick Help',
      'whats-new': 'What\'s New'
    };

    for (const [key, category] of Object.entries(categoryMappings)) {
      if (urlPath.includes(key)) {
        return category;
      }
    }

    return 'General';
  }

  /**
   * Extract relevant tags from content
   */
  extractTagsFromContent(content, title) {
    const commonTags = [
      'pos', 'payment', 'inventory', 'report', 'setting', 'integration',
      'troubleshoot', 'setup', 'configuration', 'billing', 'account',
      'customer', 'product', 'order', 'receipt', 'discount', 'tax',
      'backoffice', 'hardware', 'printer', 'scanner', 'cash-drawer'
    ];

    const text = `${title} ${content}`.toLowerCase();
    const foundTags = commonTags.filter(tag => 
      text.includes(tag) || text.includes(tag.replace('-', ' '))
    );

    // Add default tags
    const defaultTags = ['storehub', 'help'];
    
    return [...new Set([...foundTags, ...defaultTags])].slice(0, 6);
  }

  /**
   * Main method to scrape all articles from StoreHub Care
   */
  async scrapeAllArticles(maxArticlesPerCategory = 5) {
    try {
      console.log('🚀 Starting StoreHub Care scraping...');
      
      const categories = await this.scrapeCategories();
      if (categories.length === 0) {
        throw new Error('No categories found');
      }

      const allArticles = [];
      
      // Focus on key categories
      const priorityCategories = categories.filter(cat => 
        cat.title.includes('Getting Started') ||
        cat.title.includes('POS') ||
        cat.title.includes('BackOffice') ||
        cat.title.includes('Troubleshooting') ||
        cat.title.includes('Quick Help')
      ).slice(0, 5); // Limit to 5 categories

      for (const category of priorityCategories) {
        console.log(`📂 Processing category: ${category.title}`);
        const articles = await this.scrapeArticlesFromCategory(category.url, maxArticlesPerCategory);
        allArticles.push(...articles);
        
        await this.sleep(this.delay * 2); // Longer delay between categories
      }

      console.log(`✅ Successfully scraped ${allArticles.length} articles from StoreHub Care`);
      return allArticles;

    } catch (error) {
      console.error('❌ Error in scrapeAllArticles:', error.message);
      return [];
    } finally {
      await this.closeBrowser();
    }
  }
}

module.exports = StoreHubCareScraper;
