const https = require('https');
const fs = require('fs');
const path = require('path');

class ZetaCADApiScraper {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.apiUrl = 'https://www.dipos.com.tr/api/post/get';
    this.knowledgeBase = [];
    this.processedIds = new Set();
  }

  // Make API request to get posts data
  async fetchApiData(payload) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'www.dipos.com.tr',
        port: 443,
        path: '/api/post/get',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Origin': 'https://www.dipos.com.tr',
          'Referer': 'https://www.dipos.com.tr/zetacad/akademi',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
  }

  // Get all ZetaCAD akademi posts from API
  async fetchAllAkademiPosts() {
    console.log('🔍 Fetching ZetaCAD akademi posts from API...');
    
    try {
      // Try different payload structures to get all posts
      const payloads = [
        { category: 'zetacad', type: 'akademi' },
        { section: 'zetacad/akademi' },
        { path: 'zetacad/akademi' },
        { page: 1, limit: 200 },
        {} // Empty payload to get all
      ];
      
      let allPosts = [];
      
      for (const payload of payloads) {
        try {
          console.log(`📡 Trying API with payload:`, payload);
          const response = await this.fetchApiData(payload);
          
          if (response && response.data && Array.isArray(response.data)) {
            console.log(`✅ Found ${response.data.length} posts with this payload`);
            allPosts = response.data;
            break; // Found data, use it
          } else if (response && Array.isArray(response)) {
            console.log(`✅ Found ${response.length} posts (direct array)`);
            allPosts = response;
            break;
          } else {
            console.log(`📄 Response structure:`, Object.keys(response || {}));
          }
          
        } catch (error) {
          console.log(`❌ Payload failed:`, error.message);
          continue;
        }
        
        // Add delay between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return allPosts;
      
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
      return [];
    }
  }

  // Scrape specific pages (you'll need to provide the URLs)
  async scrapeSpecificPages() {
    console.log('🚀 Starting ZetaCAD Akademi HTML content extraction...');
    
    // Example URLs - you need to provide the actual akademi page URLs
    const akademiUrls = [
      'https://www.dipos.com.tr/zetacad/akademi/yazi/daire-nosu-0-olan-cizimler',
      'https://www.dipos.com.tr/zetacad/akademi/yazi/zetacad-giris-ve-temel-kullanim',
      'https://www.dipos.com.tr/zetacad/akademi/yazi/tesisat-cizim-teknikleri'
    ];
    
    console.log(`📋 Processing ${akademiUrls.length} pages...`);
    
    for (let i = 0; i < akademiUrls.length; i++) {
      const url = akademiUrls[i];
      
      try {
        console.log(`\\n📄 Processing ${i + 1}/${akademiUrls.length}: ${url}`);
        
        // Fetch the page HTML
        const html = await this.fetchPage(url);
        
        // Extract HTML content
        const extracted = this.extractHtmlContent(html, url);
        
        if (extracted && extracted.htmlContent && extracted.htmlContent.length > 100) {
          // Create knowledge base item with HTML content preserved
          const item = {
            id: extracted.id,
            title: extracted.title,
            content: extracted.htmlContent, // Raw HTML for chat display
            transcript: "",
            images: []
          };
          
          this.knowledgeBase.push(item);
          console.log(`✅ Extracted: ${extracted.title}`);
          console.log(`📏 Content length: ${extracted.htmlContent.length} characters`);
          
        } else {
          console.log(`❌ Failed to extract content from: ${url}`);
        }
        
        // Be respectful - add delay between requests
        if (i < akademiUrls.length - 1) {
          console.log('⏱️  Waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${url}:`, error.message);
      }
    }
    
    console.log(`\\n📊 Extraction completed!`);
    console.log(`✅ Successfully extracted: ${this.knowledgeBase.length} pages`);
    
    return this.knowledgeBase;
  }

  // Save the HTML knowledge base
  async saveHtmlKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'zetacad_html_knowledge_base.json');
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.knowledgeBase, null, 2), 'utf8');
      
      console.log(`\\n💾 HTML Knowledge base saved!`);
      console.log(`📁 File: ${outputPath}`);
      console.log(`📊 Total items: ${this.knowledgeBase.length}`);
      
      // Show sample of first item
      if (this.knowledgeBase.length > 0) {
        const sample = this.knowledgeBase[0];
        console.log('\\n📄 Sample item:');
        console.log(`ID: ${sample.id}`);
        console.log(`Title: ${sample.title}`);
        console.log(`Content preview: ${sample.content.substring(0, 200)}...`);
      }
      
      console.log('\\n🎉 HTML knowledge base ready for chatbot!');
      console.log('💡 The content field contains HTML that will display correctly in chat.');
      
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  }

  // Main function to run the scraper
  async run() {
    try {
      await this.scrapeSpecificPages();
      await this.saveHtmlKnowledgeBase();
    } catch (error) {
      console.error('Scraping failed:', error);
    }
  }
}

// Help function to guide user
function showUsageInstructions() {
  console.log('\\n📋 USAGE INSTRUCTIONS:');
  console.log('\\n1. Provide the specific ZetaCAD Akademi page URLs you want to scrape');
  console.log('2. The scraper will extract HTML content preserving structure');  
  console.log('3. Content will be saved with HTML tags intact for chat display');
  console.log('\\nTo customize URLs, edit the akademiUrls array in scrapeSpecificPages()');
  console.log('\\n🔍 Need help finding URLs? Please provide:');
  console.log('- The main akademi page URL');
  console.log('- Specific page URLs you want to scrape');
  console.log('- Or a sitemap/index page with all akademi content');
}

// Export for use
module.exports = ZetaCADHtmlScraper;

// Run if called directly
if (require.main === module) {
  const scraper = new ZetaCADHtmlScraper();
  
  console.log('🚀 ZetaCAD HTML Content Scraper');
  console.log('This will extract HTML content for direct use in chatbot messages');
  
  // Show instructions
  showUsageInstructions();
  
  // Run the scraper
  scraper.run().catch(console.error);
}