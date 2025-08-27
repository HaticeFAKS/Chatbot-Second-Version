const https = require('https');
const zlib = require('zlib');

class APIDebugTool {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.apiUrl = 'https://www.dipos.com.tr/api/post/get';
  }

  // Make API request with exact browser headers
  async makeAPIRequest(payload) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload);
      console.log('📤 Sending payload:', postData);
      
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
        console.log('📥 Response status:', res.statusCode);
        console.log('📥 Response headers:', res.headers);
        
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
            
            console.log('📄 Raw response length:', jsonString.length);
            console.log('📄 Raw response preview:', jsonString.substring(0, 500));
            
            if (res.statusCode === 200) {
              const jsonData = JSON.parse(jsonString);
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
            }
          } catch (error) {
            console.error('❌ Parse error. Raw response:', buffer.toString('utf8').substring(0, 1000));
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

  // Test different payloads to understand the API
  async debugAPI() {
    console.log('🔍 API Debug Tool - Testing Different Payloads\n');
    
    const testPayloads = [
      // Based on content-length: 34, let's try payloads around that size
      { "page": 1 },                    // ~12 bytes
      { "limit": 100 },                 // ~15 bytes  
      { "page": 1, "limit": 50 },       // ~24 bytes
      { "page": 1, "limit": 100 },      // ~25 bytes
      { "offset": 0, "limit": 100 },    // ~28 bytes
      { "category": "akademi" },        // ~23 bytes
      { "section": "zetacad" },         // ~22 bytes
      { "type": "post", "limit": 50 },  // ~28 bytes
      {},                               // ~2 bytes
      
      // Try specific ZetaCAD filters
      { "category": "zetacad-akademi" },
      { "path": "zetacad/akademi" },
      { "url_contains": "akademi" },
      { "tag": "zetacad" },
      
      // Try pagination scenarios to get all 192
      { "page": 1, "per_page": 25 },
      { "page": 1, "per_page": 50 },
      { "page": 1, "per_page": 100 },
      { "page": 1, "per_page": 200 },
      
      // Try different pagination styles
      { "pageNumber": 1, "pageSize": 100 },
      { "skip": 0, "take": 100 },
      { "from": 0, "size": 100 }
    ];

    let bestResponse = null;
    let maxEntries = 0;

    for (let i = 0; i < testPayloads.length; i++) {
      const payload = testPayloads[i];
      
      try {
        console.log(`\n🧪 Test ${i + 1}/${testPayloads.length}:`, JSON.stringify(payload));
        console.log('📏 Payload size:', JSON.stringify(payload).length, 'bytes');
        
        const response = await this.makeAPIRequest(payload);
        
        // Analyze response structure
        this.analyzeResponse(response, payload);
        
        // Track best response
        let entryCount = 0;
        if (response && response.data && Array.isArray(response.data)) {
          entryCount = response.data.length;
        } else if (response && Array.isArray(response)) {
          entryCount = response.length;
        } else if (response && response.posts && Array.isArray(response.posts)) {
          entryCount = response.posts.length;
        }
        
        if (entryCount > maxEntries) {
          maxEntries = entryCount;
          bestResponse = { payload, response, count: entryCount };
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log('❌ Error:', error.message);
      }
    }

    // Show best result
    if (bestResponse) {
      console.log('\n🏆 BEST RESULT:');
      console.log('📤 Payload:', JSON.stringify(bestResponse.payload));
      console.log('📊 Entry count:', bestResponse.count);
      console.log('🎯 Target: 192 entries');
      console.log('✅ Success rate:', Math.round((bestResponse.count / 192) * 100) + '%');
      
      // Show sample entries from best response
      this.showSampleEntries(bestResponse.response);
    } else {
      console.log('\n❌ No successful responses received');
    }
  }

  // Analyze response structure
  analyzeResponse(response, payload) {
    if (!response) {
      console.log('📄 Response: null');
      return;
    }

    console.log('📄 Response type:', typeof response);
    console.log('📄 Response keys:', Object.keys(response));
    
    // Check for data arrays
    let dataArray = null;
    let count = 0;
    
    if (response.data && Array.isArray(response.data)) {
      dataArray = response.data;
      count = response.data.length;
      console.log('📊 Found data array with', count, 'entries');
    } else if (Array.isArray(response)) {
      dataArray = response;
      count = response.length;
      console.log('📊 Response is direct array with', count, 'entries');
    } else if (response.posts && Array.isArray(response.posts)) {
      dataArray = response.posts;
      count = response.posts.length;
      console.log('📊 Found posts array with', count, 'entries');
    } else if (response.items && Array.isArray(response.items)) {
      dataArray = response.items;
      count = response.items.length;
      console.log('📊 Found items array with', count, 'entries');
    }
    
    // Check pagination info
    if (response.pagination) {
      console.log('📄 Pagination info:', response.pagination);
    }
    if (response.total) {
      console.log('📄 Total available:', response.total);
    }
    if (response.count) {
      console.log('📄 Count:', response.count);
    }
    
    // Check first entry structure
    if (dataArray && dataArray.length > 0) {
      const firstEntry = dataArray[0];
      console.log('📄 First entry keys:', Object.keys(firstEntry));
      if (firstEntry.title) console.log('📄 Sample title:', firstEntry.title.substring(0, 50) + '...');
      if (firstEntry.url) console.log('📄 Sample URL:', firstEntry.url);
    }
  }

  // Show sample entries from response
  showSampleEntries(response) {
    let dataArray = null;
    
    if (response && response.data && Array.isArray(response.data)) {
      dataArray = response.data;
    } else if (response && Array.isArray(response)) {
      dataArray = response;
    } else if (response && response.posts && Array.isArray(response.posts)) {
      dataArray = response.posts;
    }
    
    if (dataArray && dataArray.length > 0) {
      console.log('\n📝 SAMPLE ENTRIES:');
      const sampleCount = Math.min(3, dataArray.length);
      
      for (let i = 0; i < sampleCount; i++) {
        const entry = dataArray[i];
        console.log(`\n${i + 1}. Entry:`);
        console.log('   Title:', entry.title || 'No title');
        console.log('   URL:', entry.url || 'No URL');
        console.log('   ID:', entry.id || 'No ID');
        if (entry.category) console.log('   Category:', entry.category);
        if (entry.excerpt) console.log('   Excerpt:', entry.excerpt.substring(0, 100) + '...');
      }
    }
  }

  // Main execution
  async run() {
    try {
      await this.debugAPI();
    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
  }
}

// Export and run
module.exports = APIDebugTool;

if (require.main === module) {
  const debugTool = new APIDebugTool();
  
  console.log('🚀 ZetaCAD API Debug Tool');
  console.log('🎯 Goal: Find the correct payload to fetch all 192 entries');
  console.log('📋 Will test various payload combinations\n');
  
  debugTool.run().catch(console.error);
}