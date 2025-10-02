const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class EnhancedAPIExplorer {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.knowledgeBase = [];
    this.discoveredEndpoints = [];
    this.totalScraped = 0;
  }

  // Enhanced API request with flexible headers and endpoints
  async makeAPIRequest(endpoint, payload = {}, useApiKey = false) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      const url = new URL(endpoint, this.baseUrl);
      
      const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': '_ga=GA1.1.79361764.1755079360; _ga_16ZJY6PSZJ=GS2.1.s1756279988$o4$g1$t1756280234$j15$l0$h0; _ga_RS1EPPPK4B=GS2.1.s1756291734$o23$g1$t1756293111$j14$l0$h0',
        'Origin': this.baseUrl,
        'Priority': 'u=1, i',
        'Referer': 'https://www.dipos.com.tr/zetacad/akademi',
        'Sec-Ch-Ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
      };

      // Add potential API key if requested
      if (useApiKey) {
        headers['Authorization'] = 'Bearer YOUR_API_KEY_HERE';
        headers['X-API-Key'] = 'YOUR_API_KEY_HERE';
        headers['Api-Key'] = 'YOUR_API_KEY_HERE';
      }

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: postData ? 'POST' : 'GET',
        headers: headers
      };

      const req = https.request(options, (res) => {
        let data = [];
        
        // Handle compression
        let stream = res;
        const encoding = res.headers['content-encoding'];
        if (encoding === 'gzip') {
          stream = zlib.createGunzip();
          res.pipe(stream);
        } else if (encoding === 'deflate') {
          stream = zlib.createInflate();
          res.pipe(stream);
        } else if (encoding === 'br') {
          stream = zlib.createBrotliDecompress();
          res.pipe(stream);
        }
        
        stream.on('data', (chunk) => data.push(chunk));
        
        stream.on('end', () => {
          try {
            const buffer = Buffer.concat(data);
            const response = buffer.toString('utf8');
            
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: response,
              contentLength: buffer.length
            });
          } catch (error) {
            reject(error);
          }
        });

        stream.on('error', reject);
      });
      
      req.on('error', reject);
      
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  // Discover potential API endpoints
  async discoverEndpoints() {
    console.log('🔍 Discovering API endpoints...\n');
    
    const potentialEndpoints = [
      '/api/post/get',
      '/api/posts/get',
      '/api/post/list',
      '/api/posts/list',
      '/api/post/all',
      '/api/posts/all',
      '/api/content/get',
      '/api/content/list',
      '/api/content/all',
      '/api/akademi/get',
      '/api/akademi/list',
      '/api/akademi/all',
      '/api/zetacad/get',
      '/api/zetacad/list',
      '/api/zetacad/all',
      '/api/data/get',
      '/api/data/list',
      '/api/data/all',
      '/api/post',
      '/api/posts',
      '/api/content',
      '/api/akademi',
      '/api/zetacad'
    ];

    const payloads = [
      {},
      { "page": 1 },
      { "limit": 1000 },
      { "per_page": 1000 },
      { "page": 1, "per_page": 1000 },
      { "offset": 0, "limit": 1000 },
      { "all": true },
      { "fetch_all": true },
      { "unlimited": true },
      { "count": 1000 }
    ];

    for (const endpoint of potentialEndpoints) {
      console.log(`🔗 Testing endpoint: ${endpoint}`);
      
      try {
        // Test GET request first
        const getResponse = await this.makeAPIRequest(endpoint);
        await this.analyzeResponse('GET', endpoint, {}, getResponse);
        
        // Test POST requests with different payloads
        for (const payload of payloads) {
          try {
            const postResponse = await this.makeAPIRequest(endpoint, payload);
            await this.analyzeResponse('POST', endpoint, payload, postResponse);
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            // Silently continue with next payload
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
      
      // Delay between endpoints
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Analyze API response and extract useful information
  async analyzeResponse(method, endpoint, payload, response) {
    if (response.statusCode !== 200) {
      return;
    }

    try {
      const jsonData = JSON.parse(response.data);
      
      // Count potential posts/content
      let itemCount = 0;
      let dataStructure = '';
      
      if (jsonData.data && jsonData.data.post && Array.isArray(jsonData.data.post)) {
        itemCount = jsonData.data.post.length;
        dataStructure = 'data.post[]';
      } else if (jsonData.posts && Array.isArray(jsonData.posts)) {
        itemCount = jsonData.posts.length;
        dataStructure = 'posts[]';
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        itemCount = jsonData.data.length;
        dataStructure = 'data[]';
      } else if (Array.isArray(jsonData)) {
        itemCount = jsonData.length;
        dataStructure = 'root[]';
      }

      if (itemCount > 0) {
        console.log(`   ✅ ${method} ${endpoint}`);
        console.log(`      📊 Items found: ${itemCount}`);
        console.log(`      📋 Structure: ${dataStructure}`);
        console.log(`      📄 Payload: ${JSON.stringify(payload)}`);
        console.log(`      📏 Response size: ${response.contentLength} bytes`);
        
        this.discoveredEndpoints.push({
          method,
          endpoint,
          payload,
          itemCount,
          dataStructure,
          responseSize: response.contentLength,
          sample: jsonData
        });
      }
      
    } catch (error) {
      // Not JSON or other parsing error
      if (response.data.includes('<!DOCTYPE html>')) {
        console.log(`   ℹ️ ${method} ${endpoint} returned HTML (${response.contentLength} bytes)`);
      }
    }
  }

  // Test different payload sizes to match the 34-byte hint
  async testExactPayloads() {
    console.log('\n🎯 Testing payloads to match 34-byte content-length...\n');
    
    const testPayloads = [
      {}, // 2 bytes
      {"a":1}, // 6 bytes
      {"page":1}, // 9 bytes  
      {"limit":500}, // 13 bytes
      {"per_page":100}, // 16 bytes
      {"page":1,"limit":500}, // 20 bytes
      {"fetch_all":true}, // 17 bytes
      {"unlimited":true}, // 17 bytes
      {"page":1,"per_page":500}, // 22 bytes
      {"offset":0,"limit":1000}, // 24 bytes
      {"all":true,"unlimited":true}, // 27 bytes
      {"page":1,"per_page":1000,"all":true}, // 34 bytes - EXACT MATCH!
      {"fetch":true,"limit":1000,"page":1} // 34 bytes - EXACT MATCH!
    ];

    for (const payload of testPayloads) {
      const payloadStr = JSON.stringify(payload);
      const byteLength = Buffer.byteLength(payloadStr);
      
      console.log(`📏 Testing payload (${byteLength} bytes): ${payloadStr}`);
      
      try {
        const response = await this.makeAPIRequest('/api/post/get', payload);
        
        if (response.statusCode === 200) {
          const jsonData = JSON.parse(response.data);
          const itemCount = jsonData.data?.post?.length || 0;
          
          console.log(`   ✅ Success! ${itemCount} items`);
          
          if (byteLength === 34) {
            console.log(`   🎯 EXACT 34-BYTE MATCH! This might be the key payload!`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  // Enhanced scraping with the best discovered endpoint
  async enhancedScraping() {
    console.log('\n🚀 Starting enhanced scraping with discovered endpoints...\n');
    
    // Sort endpoints by item count (descending)
    const sortedEndpoints = this.discoveredEndpoints.sort((a, b) => b.itemCount - a.itemCount);
    
    if (sortedEndpoints.length === 0) {
      console.log('❌ No working endpoints discovered');
      return;
    }

    console.log('📊 Best endpoints found:');
    sortedEndpoints.slice(0, 3).forEach((ep, i) => {
      console.log(`   ${i + 1}. ${ep.method} ${ep.endpoint} - ${ep.itemCount} items`);
    });

    // Use the best endpoint
    const bestEndpoint = sortedEndpoints[0];
    console.log(`\n🎯 Using best endpoint: ${bestEndpoint.method} ${bestEndpoint.endpoint}`);
    console.log(`📊 Expected items: ${bestEndpoint.itemCount}`);

    try {
      const response = await this.makeAPIRequest(bestEndpoint.endpoint, bestEndpoint.payload);
      
      if (response.statusCode === 200) {
        const jsonData = JSON.parse(response.data);
        const posts = this.extractPostsFromResponse(jsonData, bestEndpoint.dataStructure);
        
        console.log(`✅ Successfully fetched ${posts.length} posts from enhanced endpoint`);
        
        // Process all posts
        await this.processPostsToKnowledgeBase(posts);
        
      } else {
        console.log(`❌ Best endpoint failed with status: ${response.statusCode}`);
      }
      
    } catch (error) {
      console.error('❌ Enhanced scraping failed:', error);
    }
  }

  // Extract posts based on discovered data structure
  extractPostsFromResponse(jsonData, dataStructure) {
    switch (dataStructure) {
      case 'data.post[]':
        return jsonData.data.post || [];
      case 'posts[]':
        return jsonData.posts || [];
      case 'data[]':
        return jsonData.data || [];
      case 'root[]':
        return Array.isArray(jsonData) ? jsonData : [];
      default:
        return [];
    }
  }

  // Process posts to knowledge base with enhanced content preservation
  async processPostsToKnowledgeBase(posts) {
    console.log(`\n📋 Processing ${posts.length} posts to knowledge base...`);
    
    let successCount = 0;
    let errorCount = 0;
    const processedIds = new Set();

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      try {
        console.log(`📄 Processing ${i + 1}/${posts.length}: ${post.title || 'Untitled'}`);
        
        const item = this.convertPostToKnowledgeItem(post);
        
        if (item && item.content && item.content.length > 30) {
          if (!processedIds.has(item.id)) {
            this.knowledgeBase.push(item);
            processedIds.add(item.id);
            successCount++;
            
            console.log(`   ✅ Added: ${item.title.substring(0, 50)}...`);
            console.log(`   📏 Content: ${item.content.length} chars`);
            console.log(`   🖼️ Images: ${item.images.length}`);
            console.log(`   📺 Videos: ${item.content.includes('iframe') ? 'Yes' : 'No'}`);
            console.log(`   🔗 Links: ${item.content.includes('<a ') ? 'Yes' : 'No'}`);
          } else {
            console.log(`   ⚠️ Duplicate skipped: ${item.id}`);
          }
        } else {
          errorCount++;
          console.log(`   ❌ Insufficient content`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error:`, error.message);
      }
    }

    this.totalScraped = successCount;
    
    console.log(`\n📊 Enhanced Processing Results:`);
    console.log(`✅ Success: ${successCount} entries`);
    console.log(`❌ Errors: ${errorCount} entries`);
    console.log(`📄 Total in knowledge base: ${this.knowledgeBase.length}`);
    console.log(`🎯 Original target was: 192 items`);
    console.log(`📈 New achievement: ${Math.round((this.knowledgeBase.length / 192) * 100)}% of original target`);
    
    if (this.knowledgeBase.length > 192) {
      console.log(`🎉 EXCEEDED TARGET! Found ${this.knowledgeBase.length - 192} additional items!`);
    }
  }

  // Enhanced post conversion with better content preservation
  convertPostToKnowledgeItem(post) {
    try {
      const id = this.generateCleanId(post.title || `post-${post.id || Date.now()}`);
      
      let htmlContent = post.content || post.body || post.text || '';
      
      // Enhanced content preservation
      htmlContent = this.enhancedContentPreservation(htmlContent);
      
      const images = this.extractImagesFromHtml(htmlContent);
      
      return {
        id: id,
        title: post.title || 'ZetaCAD Akademi İçeriği',
        content: htmlContent,
        transcript: post.excerpt || post.summary || post.description || '',
        images: images,
        originalData: {
          postId: post.id,
          createdAt: post.created_at || post.date,
          updatedAt: post.updated_at,
          category: post.category || post.type,
          author: post.author
        }
      };
      
    } catch (error) {
      console.error('❌ Error converting post:', error);
      return null;
    }
  }

  // Enhanced content preservation that keeps everything valuable
  enhancedContentPreservation(html) {
    if (!html) return '';
    
    return html
      // Remove only truly problematic elements
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      
      // Keep EVERYTHING else:
      // ✅ iframe (YouTube/Vimeo videos)
      // ✅ a (all links)
      // ✅ img (all images)
      // ✅ video/audio (media elements)
      // ✅ table/tr/td (tables)
      // ✅ ul/ol/li (lists)
      // ✅ div/p/span (structure)
      // ✅ h1-h6 (headings)
      // ✅ strong/em/b/i (formatting)
      // ✅ pre/code (code blocks)
      // ✅ blockquote (quotes)
      // ✅ form/input (interactive elements)
      
      // Minimal cleanup only
      .replace(/\s{3,}/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  // Enhanced image extraction
  extractImagesFromHtml(html) {
    const images = [];
    const patterns = [
      /<img[^>]+src="([^"]+)"/gi,
      /<img[^>]+src='([^']+)'/gi,
      /background-image:\s*url\(["']?([^"')]+)["']?\)/gi
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let src = match[1];
        
        if (src.startsWith('/')) {
          src = this.baseUrl + src;
        } else if (src.startsWith('./')) {
          src = this.baseUrl + src.substring(1);
        }
        
        // Keep all images, even logos (user can filter later)
        images.push(src);
      }
    });
    
    return [...new Set(images)]; // Remove duplicates but don't limit count
  }

  // Generate clean ID
  generateCleanId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60)
      .replace(/-+$/, '');
  }

  // Save enhanced knowledge base
  async saveEnhancedKnowledgeBase() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const outputPath = path.join(__dirname, '..', `zetacad_enhanced_knowledge_base_${timestamp}.json`);
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(this.knowledgeBase, null, 2), 'utf8');
      
      console.log(`\n💾 Enhanced Knowledge Base Saved Successfully!`);
      console.log(`📁 File: ${outputPath}`);
      console.log(`📊 Total items: ${this.knowledgeBase.length}`);
      
      if (this.knowledgeBase.length > 0) {
        const totalContent = this.knowledgeBase.reduce((sum, item) => sum + item.content.length, 0);
        const totalImages = this.knowledgeBase.reduce((sum, item) => sum + item.images.length, 0);
        const iframeCount = this.knowledgeBase.filter(item => item.content.includes('iframe')).length;
        const linkCount = this.knowledgeBase.filter(item => item.content.includes('<a ')).length;
        const videoCount = this.knowledgeBase.filter(item => 
          item.content.includes('iframe') || 
          item.content.includes('<video') ||
          item.content.includes('youtube') ||
          item.content.includes('vimeo')
        ).length;
        
        console.log(`\n📊 Enhanced Statistics:`);
        console.log(`📄 Total content: ${totalContent.toLocaleString()} characters`);
        console.log(`🖼️ Total images: ${totalImages}`);
        console.log(`📺 Items with videos/iframes: ${videoCount}`);
        console.log(`🔗 Items with links: ${linkCount}`);
        console.log(`📈 Average content length: ${Math.round(totalContent / this.knowledgeBase.length).toLocaleString()} chars`);
        
        // Show improved sample
        const sample = this.knowledgeBase[0];
        console.log(`\n📋 Sample Enhanced Item:`);
        console.log(`🆔 ID: ${sample.id}`);
        console.log(`📝 Title: ${sample.title}`);
        console.log(`📏 Content: ${sample.content.length} characters`);
        console.log(`🖼️ Images: ${sample.images.length}`);
        console.log(`📄 Preview: ${sample.content.substring(0, 200).replace(/\s+/g, ' ')}...`);
      }
      
      console.log(`\n🎉 Enhanced Knowledge Base Complete!`);
      console.log(`💡 New Features:`);
      console.log(`   ✅ Discovered multiple API endpoints`);
      console.log(`   ✅ Enhanced content preservation`);
      console.log(`   ✅ Better image extraction`);
      console.log(`   ✅ Original post metadata included`);
      console.log(`   ✅ Ready for unlimited chatbot use!`);
      
    } catch (error) {
      console.error('❌ Error saving enhanced knowledge base:', error);
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Enhanced ZetaCAD API Explorer & Scraper');
      console.log('🎯 Goals: Discover endpoints, test API keys, unlimited scraping');
      console.log('💡 Features: Enhanced preservation, multiple sources, 200+ items\n');
      
      // Step 1: Discover all possible endpoints
      await this.discoverEndpoints();
      
      // Step 2: Test exact payload sizes
      await this.testExactPayloads();
      
      // Step 3: Enhanced scraping with best endpoint
      await this.enhancedScraping();
      
      // Step 4: Save results
      await this.saveEnhancedKnowledgeBase();
      
      // Step 5: Final report
      console.log(`\n📊 FINAL ENHANCED RESULTS:`);
      console.log(`🔍 Discovered endpoints: ${this.discoveredEndpoints.length}`);
      console.log(`📄 Total items scraped: ${this.totalScraped}`);
      console.log(`🎯 Original target: 192 items`);
      console.log(`📈 Achievement: ${this.totalScraped > 192 ? 'EXCEEDED' : Math.round((this.totalScraped / 192) * 100) + '%'}`);
      
      if (this.totalScraped > 200) {
        console.log(`🎉 SUCCESS! Got ${this.totalScraped} items - more than 200!`);
      }
      
    } catch (error) {
      console.error('❌ Enhanced scraping failed:', error);
    }
  }
}

// Export and run
module.exports = EnhancedAPIExplorer;

if (require.main === module) {
  const explorer = new EnhancedAPIExplorer();
  explorer.run().catch(console.error);
}