const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class WorkingZetaCADScraper {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.apiUrl = 'https://www.dipos.com.tr/api/post/get';
    this.knowledgeBase = [];
    this.processedIds = new Set();
  }

  // Make API request with exact headers from browser
  async fetchApiData(payload) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      
      const options = {
        hostname: 'www.dipos.com.tr',
        port: 443,
        path: '/api/post/get',
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Cookie': '_ga=GA1.1.79361764.1755079360; _ga_16ZJY6PSZJ=GS2.1.s1756279988$o4$g1$t1756280234$j15$l0$h0; _ga_RS1EPPPK4B=GS2.1.s1756291734$o23$g1$t1756293111$j14$l0$h0',
          'Origin': 'https://www.dipos.com.tr',
          'Priority': 'u=1, i',
          'Referer': 'https://www.dipos.com.tr/zetacad/akademi',
          'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        }
      };

      const req = https.request(options, (res) => {
        let data = [];
        
        // Handle gzip encoding properly
        let stream = res;
        if (res.headers['content-encoding'] === 'gzip') {
          stream = zlib.createGunzip();
          res.pipe(stream);
        } else if (res.headers['content-encoding'] === 'deflate') {
          stream = zlib.createInflate();
          res.pipe(stream);
        } else if (res.headers['content-encoding'] === 'br') {
          stream = zlib.createBrotliDecompress();
          res.pipe(stream);
        }
        
        stream.on('data', (chunk) => {
          data.push(chunk);
        });
        
        stream.on('end', () => {
          try {
            const buffer = Buffer.concat(data);
            const jsonString = buffer.toString('utf8');
            
            if (res.statusCode === 200) {
              const jsonData = JSON.parse(jsonString);
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            }
          } catch (error) {
            console.error('❌ Parse error. Response length:', buffer.length);
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
  }

  // Extract and process posts from API response
  processApiResponse(response) {
    console.log('📋 Processing API response...');
    
    if (!response || !response.success) {
      console.log('❌ API response indicates failure');
      return [];
    }
    
    if (!response.data || !response.data.post || !Array.isArray(response.data.post)) {
      console.log('❌ Invalid data structure in response');
      console.log('📄 Response structure:', Object.keys(response));
      if (response.data) console.log('📄 Data structure:', Object.keys(response.data));
      return [];
    }
    
    const posts = response.data.post;
    console.log(`✅ Found ${posts.length} posts in API response`);
    
    return posts;
  }

  // Convert API post to knowledge base item
  convertPostToKnowledgeItem(post) {
    try {
      // Generate clean ID
      const id = this.generateCleanId(post.title || `post-${post.id}`);
      
      // Extract and preserve HTML content
      let htmlContent = post.content || '';
      
      // Clean minimal - only remove obviously bad elements
      htmlContent = this.preserveHtmlContent(htmlContent);
      
      // Extract images from HTML
      const images = this.extractImagesFromHtml(htmlContent);
      
      const item = {
        id: id,
        title: post.title || 'ZetaCAD Akademi İçeriği',
        content: htmlContent, // Keep original HTML structure
        transcript: post.excerpt || post.summary || '',
        images: images
      };
      
      return item;
      
    } catch (error) {
      console.error('❌ Error converting post:', error);
      return null;
    }
  }

  // Generate clean ID from title
  generateCleanId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .substring(0, 50) // Limit length
      .replace(/-+$/, ''); // Remove trailing dashes
  }

  // Preserve HTML content structure for chat display
  preserveHtmlContent(html) {
    if (!html) return '';
    
    return html
      // Remove only problematic elements, keep videos and links
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
      
      // Keep all important elements:
      // - iframe (YouTube videos) 
      // - a (links)
      // - img (images)
      // - div, p, h1-h6 (structure)
      // - table, tr, td (tables)
      // - ul, ol, li (lists)
      // - strong, em (formatting)
      
      // Only minimal cleanup
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Extract images from HTML content
  extractImagesFromHtml(html) {
    const images = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      let src = match[1];
      
      // Convert relative URLs to absolute
      if (src.startsWith('/')) {
        src = this.baseUrl + src;
      }
      
      // Filter out logos and icons
      if (!src.includes('logo') && !src.includes('icon') && !src.includes('favicon')) {
        images.push(src);
      }
    }
    
    return [...new Set(images)].slice(0, 4); // Remove duplicates, limit to 4
  }

  // Fetch all posts with the discovered API structure
  async fetchAllPosts() {
    console.log('🔍 Fetching all posts from ZetaCAD Akademi API...');
    
    try {
      // Based on debug output, API returns all posts regardless of payload
      // Try simple payloads first
      const payloads = [
        {}, // Empty - might return everything
        { "page": 1 }, // Simple pagination
        { "limit": 500 }, // High limit
        { "page": 1, "per_page": 500 }, // Pagination with high limit
      ];
      
      for (const payload of payloads) {
        try {
          console.log(`📡 Trying payload:`, JSON.stringify(payload));
          const response = await this.fetchApiData(payload);
          
          const posts = this.processApiResponse(response);
          
          if (posts && posts.length > 0) {
            console.log(`✅ Successfully fetched ${posts.length} posts`);
            return posts;
          }
          
        } catch (error) {
          console.log(`❌ Payload failed:`, error.message);
        }
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('❌ All payloads failed');
      return [];
      
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      return [];
    }
  }

  // Process all posts and create knowledge base
  async processAllPosts() {
    console.log('🚀 Starting ZetaCAD Akademi content extraction...');
    
    const posts = await this.fetchAllPosts();
    
    if (!posts || posts.length === 0) {
      console.log('❌ No posts received from API');
      return;
    }
    
    console.log(`📋 Processing ${posts.length} posts...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      try {
        console.log(`\n📄 Processing ${i + 1}/${posts.length}: ${post.title || 'Untitled'}`);
        
        const item = this.convertPostToKnowledgeItem(post);
        
        if (item && item.content && item.content.length > 50) {
          if (!this.processedIds.has(item.id)) {
            this.knowledgeBase.push(item);
            this.processedIds.add(item.id);
            successCount++;
            
            console.log(`✅ Added: ${item.title}`);
            console.log(`📏 Content length: ${item.content.length} characters`);
            console.log(`🖼️ Images: ${item.images.length}`);
            console.log(`📺 Has iframe: ${item.content.includes('iframe') ? 'Yes' : 'No'}`);
            console.log(`🔗 Has links: ${item.content.includes('<a ') ? 'Yes' : 'No'}`);
          } else {
            console.log(`⚠️ Duplicate ID skipped: ${item.id}`);
          }
        } else {
          errorCount++;
          console.log(`❌ Failed to process: insufficient content`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing post:`, error.message);
      }
    }
    
    console.log(`\n📊 Processing completed:`);
    console.log(`✅ Success: ${successCount} entries`);
    console.log(`❌ Errors: ${errorCount} entries`);
    console.log(`📄 Total in knowledge base: ${this.knowledgeBase.length}`);
  }

  // Save the knowledge base
  async saveKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'zetacad_api_complete_knowledge_base.json');
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.knowledgeBase, null, 2), 'utf8');
      
      console.log(`\n💾 Knowledge base saved successfully!`);
      console.log(`📁 File: ${outputPath}`);
      console.log(`📊 Total items: ${this.knowledgeBase.length}`);
      console.log(`🎯 Target was: 192 items`);
      console.log(`📈 Success rate: ${Math.round((this.knowledgeBase.length / 192) * 100)}%`);
      
      if (this.knowledgeBase.length > 0) {
        const totalContent = this.knowledgeBase.reduce((sum, item) => sum + item.content.length, 0);
        const totalImages = this.knowledgeBase.reduce((sum, item) => sum + item.images.length, 0);
        const iframeCount = this.knowledgeBase.filter(item => item.content.includes('iframe')).length;
        const linkCount = this.knowledgeBase.filter(item => item.content.includes('<a ')).length;
        
        console.log(`📄 Total content: ${totalContent.toLocaleString()} characters`);
        console.log(`🖼️ Total images: ${totalImages}`);
        console.log(`📺 Items with videos: ${iframeCount}`);
        console.log(`🔗 Items with links: ${linkCount}`);
        
        // Show sample
        const sample = this.knowledgeBase[0];
        console.log('\n📄 Sample item:');
        console.log(`ID: ${sample.id}`);
        console.log(`Title: ${sample.title}`);
        console.log(`Content preview: ${sample.content.substring(0, 300).replace(/\s+/g, ' ')}...`);
      }
      
      console.log('\n🎉 Complete knowledge base ready for chatbot!');
      console.log('💡 Features preserved:');
      console.log('   ✅ YouTube videos (iframe tags)');
      console.log('   ✅ Clickable links (a tags)');
      console.log('   ✅ Images (img tags)');
      console.log('   ✅ HTML formatting (tables, lists, etc.)');
      
    } catch (error) {
      console.error('❌ Error saving knowledge base:', error);
    }
  }

  // Main execution
  async run() {
    try {
      await this.processAllPosts();
      await this.saveKnowledgeBase();
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    }
  }
}

// Export and run
module.exports = WorkingZetaCADScraper;

if (require.main === module) {
  const scraper = new WorkingZetaCADScraper();
  
  console.log('🚀 Working ZetaCAD Akademi Scraper');
  console.log('🎯 Target: Extract all posts with preserved HTML structure');
  console.log('💡 Preserves: YouTube videos, links, images, tables, formatting');
  console.log('📱 Output: Ready for direct chatbot use\n');
  
  scraper.run().catch(console.error);
}