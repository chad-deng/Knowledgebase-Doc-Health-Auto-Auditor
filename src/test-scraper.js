const StoreHubCareScraper = require('./services/StoreHubCareScraper');

async function testScraper() {
  console.log('🚀 Testing StoreHub Care Scraper...\n');
  
  const scraper = new StoreHubCareScraper();
  
  try {
    // Test 1: Scrape categories
    console.log('📂 Test 1: Scraping categories...');
    const categories = await scraper.scrapeCategories();
    console.log(`Found ${categories.length} categories:`);
    categories.slice(0, 3).forEach(cat => {
      console.log(`  - ${cat.title}: ${cat.description.substring(0, 50)}...`);
    });
    console.log('');
    
    // Test 2: Scrape articles from one category
    if (categories.length > 0) {
      console.log('📄 Test 2: Scraping articles from first category...');
      const firstCategory = categories[0];
      console.log(`Scraping from: ${firstCategory.title}`);
      
      const articles = await scraper.scrapeArticlesFromCategory(firstCategory.url, 2);
      console.log(`Found ${articles.length} articles:`);
      articles.forEach(article => {
        console.log(`  - ${article.title}`);
        console.log(`    Category: ${article.category}`);
        console.log(`    Tags: ${article.tags.join(', ')}`);
        console.log(`    Content length: ${article.content.length} chars`);
        console.log('');
      });
    }
    
    // Test 3: Full scraping (limited)
    console.log('🏪 Test 3: Full StoreHub Care scraping (limited)...');
    const allArticles = await scraper.scrapeAllArticles(2); // 2 articles per category
    console.log(`\n✅ Total articles scraped: ${allArticles.length}`);
    
    // Show summary
    const categoryCounts = {};
    allArticles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });
    
    console.log('\n📊 Articles by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} articles`);
    });
    
    // Show sample article
    if (allArticles.length > 0) {
      console.log('\n📖 Sample article:');
      const sample = allArticles[0];
      console.log(`Title: ${sample.title}`);
      console.log(`Category: ${sample.category}`);
      console.log(`Tags: ${sample.tags.join(', ')}`);
      console.log(`URL: ${sample.url}`);
      console.log(`Content preview: ${sample.content.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await scraper.closeBrowser();
    console.log('\n🏁 Test completed!');
  }
}

// Run the test
if (require.main === module) {
  testScraper();
}

module.exports = testScraper;
