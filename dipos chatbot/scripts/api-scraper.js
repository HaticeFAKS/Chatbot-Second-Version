const https = require('https');
const fs = require('fs');
const path = require('path');

class ZetaCADApiScraper {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.apiUrl = '/api/post/get';
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
        path: this.apiUrl,
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
        { page: 1, limit: 500 }, // Increased limit to get more posts
        { filter: 'akademi' },
        { search: 'zetacad' },
        {} // Empty payload to get all
      ];
      
      let allPosts = [];
      
      for (const payload of payloads) {
        try {
          console.log(`📡 Trying API with payload:`, JSON.stringify(payload));
          const response = await this.fetchApiData(payload);
          
          console.log(`📄 Response keys:`, Object.keys(response || {}));
          
          // Check different response structures
          if (response && response.data && Array.isArray(response.data)) {
            console.log(`✅ Found ${response.data.length} posts with this payload`);
            allPosts = response.data;
            break; // Found data, use it
          } else if (response && Array.isArray(response)) {
            console.log(`✅ Found ${response.length} posts (direct array)`);
            allPosts = response;
            break;
          } else if (response && response.posts && Array.isArray(response.posts)) {
            console.log(`✅ Found ${response.posts.length} posts in posts field`);
            allPosts = response.posts;
            break;
          } else if (response && response.items && Array.isArray(response.items)) {
            console.log(`✅ Found ${response.items.length} posts in items field`);
            allPosts = response.items;
            break;
          } else {
            console.log(`🔄 Payload didn't return expected structure, trying next...`);
          }
          
        } catch (error) {
          console.log(`❌ Payload failed:`, error.message);
          continue;
        }
        
        // Add delay between attempts to be respectful
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      return allPosts;
      
    } catch (error) {
      console.error('❌ Error fetching from API:', error);
      return [];
    }
  }

  // Process API post data into knowledge base format with HTML preserved
  processPostData(post) {
    try {
      // Extract relevant fields from API response
      const id = post.id || post.slug || post.url || `post-${Date.now()}`;
      const title = post.title || post.name || post.heading || 'ZetaCAD Akademi İçeriği';
      let content = post.content || post.body || post.description || post.text || '';
      
      // If content is HTML, preserve it; if it's plain text, wrap in basic HTML
      if (content && content.length > 20) {
        if (!content.includes('<')) {
          // Plain text - wrap in basic HTML structure for chat display
          content = `<div class="akademi-content">
  <h2>${title}</h2>
  <div class="content-text">
    ${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('\n    ')}
  </div>
</div>`;
        } else {
          // Already HTML - clean it up but preserve structure
          content = content
            // Remove dangerous scripts
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            // Clean up excessive whitespace but preserve HTML structure
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
        }
      }
      
      // Extract images if available
      const images = [];
      if (post.images && Array.isArray(post.images)) {
        images.push(...post.images);
      } else if (post.image) {
        images.push(post.image);
      } else if (post.featured_image) {
        images.push(post.featured_image);
      }
      
      // Look for images in content
      if (content) {
        const imgMatches = content.match(/<img[^>]+src="([^"]+)"/gi);
        if (imgMatches) {
          imgMatches.forEach(match => {
            const srcMatch = match.match(/src="([^"]+)"/i);
            if (srcMatch && srcMatch[1]) {
              let src = srcMatch[1];
              if (src.startsWith('/')) {
                src = this.baseUrl + src;
              }
              if (!images.includes(src)) {
                images.push(src);
              }
            }
          });
        }
      }
      
      return {
        id: String(id).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        title: title,
        content: content, // HTML content preserved for chat display
        transcript: post.excerpt || post.summary || "",
        images: images.slice(0, 4) // Limit to 4 images as per requirements
      };
      
    } catch (error) {
      console.error('Error processing post data:', error);
      return null;
    }
  }

  // Main scraping function using API
  async scrapeFromApi() {
    console.log('🚀 Starting ZetaCAD Akademi API extraction...');
    
    try {
      // Fetch all posts from API
      const posts = await this.fetchAllAkademiPosts();
      
      if (!posts || posts.length === 0) {
        console.log('❌ No posts found from API');
        console.log('💡 This might be because:');
        console.log('   - The API requires authentication');
        console.log('   - Different payload structure is needed');
        console.log('   - The endpoint has changed');
        return [];
      }
      
      console.log(`📋 Processing ${posts.length} posts from API...`);
      
      // Process each post
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        
        try {
          const postTitle = post.title || post.name || `Post ${i + 1}`;
          console.log(`\n📄 Processing ${i + 1}/${posts.length}: ${postTitle}`);
          
          const processedItem = this.processPostData(post);
          
          if (processedItem && processedItem.content && processedItem.content.length > 50) {
            // Avoid duplicates
            if (!this.processedIds.has(processedItem.id)) {
              this.knowledgeBase.push(processedItem);
              this.processedIds.add(processedItem.id);
              
              console.log(`✅ Added: ${processedItem.title}`);
              console.log(`📏 Content length: ${processedItem.content.length} characters`);
              console.log(`🖼️ Images: ${processedItem.images.length}`);
            } else {
              console.log(`⚠️ Skipped duplicate: ${processedItem.title}`);
            }
          } else {
            console.log(`❌ Insufficient content: ${postTitle}`);
          }
          
        } catch (error) {
          console.error(`❌ Error processing post ${i + 1}:`, error.message);
        }
      }
      
      console.log(`\n📊 API extraction completed!`);
      console.log(`✅ Successfully processed: ${this.knowledgeBase.length} items`);
      
      return this.knowledgeBase;
      
    } catch (error) {
      console.error('❌ API scraping failed:', error);
      return [];
    }
  }

  // Save the knowledge base with HTML content
  async saveKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'zetacad_api_knowledge_base.json');
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.knowledgeBase, null, 2), 'utf8');
      
      console.log(`\n💾 Knowledge base saved successfully!`);
      console.log(`📁 File: ${outputPath}`);
      console.log(`📊 Total items: ${this.knowledgeBase.length}`);
      
      // Show statistics
      if (this.knowledgeBase.length > 0) {
        const totalContent = this.knowledgeBase.reduce((sum, item) => sum + item.content.length, 0);
        const totalImages = this.knowledgeBase.reduce((sum, item) => sum + item.images.length, 0);
        
        console.log(`📄 Total content: ${totalContent} characters`);
        console.log(`🖼️ Total images: ${totalImages}`);
        
        // Show sample of first item
        const sample = this.knowledgeBase[0];
        console.log('\n📄 Sample item:');
        console.log(`ID: ${sample.id}`);
        console.log(`Title: ${sample.title}`);
        console.log(`Content preview: ${sample.content.substring(0, 150)}...`);
        console.log(`Images: ${sample.images.length}`);
      }
      
      console.log('\n🎉 Knowledge base ready for chatbot!');
      console.log('💡 Content includes HTML that will render correctly in chat.');
      
    } catch (error) {
      console.error('❌ Error saving knowledge base:', error);
    }
  }

  // Main function to run the API scraper
  async run() {
    try {
      console.log('🚀 ZetaCAD API Content Scraper');
      console.log('📡 Using discovered API endpoint: https://www.dipos.com.tr/api/post/get');
      console.log('💡 This will extract content with HTML preserved for chatbot display\n');
      
      await this.scrapeFromApi();
      await this.saveKnowledgeBase();
      
      if (this.knowledgeBase.length === 0) {
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('If no content was extracted, you may need to:');
        console.log('1. Check if the API requires authentication');
        console.log('2. Inspect the actual API payload structure');
        console.log('3. Look for different API endpoints');
        console.log('4. Provide specific post IDs or categories');
      }
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    }
  }
}

// Export for use
module.exports = ZetaCADApiScraper;

// Run if called directly
if (require.main === module) {
  const scraper = new ZetaCADApiScraper();
  scraper.run();
}