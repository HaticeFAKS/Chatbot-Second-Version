const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class QuickAPIAnalyzer {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.results = [];
  }

  async makeRequest(endpoint, payload = {}, method = 'POST') {
    return new Promise((resolve, reject) => {
      const postData = method === 'POST' ? JSON.stringify(payload) : '';
      const url = new URL(endpoint, this.baseUrl);
      
      const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/json',
        'Cookie': '_ga=GA1.1.79361764.1755079360; _ga_16ZJY6PSZJ=GS2.1.s1756279988$o4$g1$t1756280234$j15$l0$h0; _ga_RS1EPPPK4B=GS2.1.s1756291734$o23$g1$t1756293111$j14$l0$h0',
        'Origin': this.baseUrl,
        'Referer': 'https://www.dipos.com.tr/zetacad/akademi',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
      };

      if (method === 'POST') {
        headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: method,
        headers: headers
      };

      const req = https.request(options, (res) => {
        let data = [];
        
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
        
        stream.on('data', chunk => data.push(chunk));
        stream.on('end', () => {
          const buffer = Buffer.concat(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: buffer.toString('utf8'),
            size: buffer.length
          });
        });
        stream.on('error', reject);
      });
      
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  async analyzeCurrentAPI() {
    console.log('🔍 1. Analyzing current API endpoint patterns...\n');
    
    // Test the exact 34-byte payload hint from user
    const exactPayloads = [
      {"page":1,"per_page":1000,"all":true}, // Exactly 34 bytes
      {"fetch":true,"limit":1000,"page":1}, // Exactly 34 bytes
      {"unlimited":true,"count":1000,"p":1}, // Exactly 34 bytes
    ];

    for (const payload of exactPayloads) {
      const payloadStr = JSON.stringify(payload);
      const byteLength = Buffer.byteLength(payloadStr);
      
      console.log(`📏 Testing exact ${byteLength}-byte payload: ${payloadStr}`);
      
      try {
        const response = await this.makeRequest('/api/post/get', payload);
        
        if (response.statusCode === 200) {
          const jsonData = JSON.parse(response.data);
          const itemCount = jsonData.data?.post?.length || 0;
          
          console.log(`   ✅ Status: ${response.statusCode} | Items: ${itemCount} | Response: ${response.size} bytes`);
          
          if (byteLength === 34) {
            console.log(`   🎯 PERFECT MATCH! This 34-byte payload works!`);
            this.results.push({
              type: 'exact_match',
              payload: payload,
              itemCount: itemCount,
              responseSize: response.size
            });
          }
        } else {
          console.log(`   ❌ Status: ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  async discoverMoreEndpoints() {
    console.log('\n🔍 2. Discovering additional API endpoints...\n');
    
    const endpoints = [
      '/api/post/list',
      '/api/posts/all',
      '/api/content/get',
      '/api/akademi/get',
      '/api/zetacad/posts',
      '/api/data/all',
      '/api/v1/post/get',
      '/api/v2/post/get'
    ];

    for (const endpoint of endpoints) {
      console.log(`🔗 Testing: ${endpoint}`);
      
      try {
        // Test with empty payload
        const response = await this.makeRequest(endpoint, {});
        
        if (response.statusCode === 200) {
          try {
            const jsonData = JSON.parse(response.data);
            let itemCount = 0;
            
            // Try to extract item count from different structures
            if (jsonData.data?.post) itemCount = jsonData.data.post.length;
            else if (jsonData.posts) itemCount = jsonData.posts.length;
            else if (jsonData.data && Array.isArray(jsonData.data)) itemCount = jsonData.data.length;
            else if (Array.isArray(jsonData)) itemCount = jsonData.length;
            
            console.log(`   ✅ Success! ${itemCount} items found`);
            
            if (itemCount > 192) {
              console.log(`   🎉 JACKPOT! More than 192 items: ${itemCount}`);
              this.results.push({
                type: 'more_data',
                endpoint: endpoint,
                itemCount: itemCount,
                responseSize: response.size
              });
            }
            
          } catch (parseError) {
            console.log(`   ⚠️ Non-JSON response (${response.size} bytes)`);
          }
        } else {
          console.log(`   ❌ Status: ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async testAPIKeyUsage() {
    console.log('\n🔍 3. Testing API key usage patterns...\n');
    
    const apiKeyTests = [
      { header: 'Authorization', value: 'Bearer test-key' },
      { header: 'X-API-Key', value: 'test-api-key' },
      { header: 'Api-Key', value: 'test-key' },
      { header: 'X-Auth-Token', value: 'test-token' }
    ];

    for (const test of apiKeyTests) {
      console.log(`🔑 Testing ${test.header}: ${test.value}`);
      
      try {
        const payload = {};
        const postData = JSON.stringify(payload);
        
        const options = {
          hostname: 'www.dipos.com.tr',
          port: 443,
          path: '/api/post/get',
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            [test.header]: test.value
          }
        };

        const response = await new Promise((resolve, reject) => {
          const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
              statusCode: res.statusCode,
              data: data
            }));
          });
          req.on('error', reject);
          req.write(postData);
          req.end();
        });

        if (response.statusCode === 401 || response.statusCode === 403) {
          console.log(`   🔐 API Key might be required! Status: ${response.statusCode}`);
          this.results.push({
            type: 'api_key_hint',
            header: test.header,
            statusCode: response.statusCode
          });
        } else if (response.statusCode === 200) {
          console.log(`   ✅ No API key needed or test key worked: ${response.statusCode}`);
        } else {
          console.log(`   ❌ Status: ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  async checkPaginationLimits() {
    console.log('\n🔍 4. Testing pagination for 200+ entries...\n');
    
    const paginationTests = [
      { page: 1, per_page: 1000 },
      { page: 2, per_page: 100 },
      { page: 3, per_page: 100 },
      { offset: 192, limit: 100 },
      { start: 200, count: 100 }
    ];

    for (const params of paginationTests) {
      console.log(`📄 Testing pagination: ${JSON.stringify(params)}`);
      
      try {
        const response = await this.makeRequest('/api/post/get', params);
        
        if (response.statusCode === 200) {
          const jsonData = JSON.parse(response.data);
          const itemCount = jsonData.data?.post?.length || 0;
          
          console.log(`   ✅ Found ${itemCount} items`);
          
          if (itemCount > 0) {
            this.results.push({
              type: 'pagination_success',
              params: params,
              itemCount: itemCount
            });
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  async generateReport() {
    console.log('\n📊 ANALYSIS REPORT\n');
    console.log('=' * 50);
    
    // Question 1: Do you need more GET endpoints?
    console.log('\n❓ 1. DO YOU NEED MORE GET ENDPOINTS?');
    const moreDataResults = this.results.filter(r => r.type === 'more_data');
    if (moreDataResults.length > 0) {
      console.log('✅ YES! Found additional endpoints with more data:');
      moreDataResults.forEach(result => {
        console.log(`   📍 ${result.endpoint}: ${result.itemCount} items`);
      });
    } else {
      console.log('❌ No additional endpoints found with more data than current 192');
    }

    // Question 2: Did you catch a general pattern?
    console.log('\n❓ 2. DID YOU CATCH A GENERAL PATTERN?');
    const exactMatches = this.results.filter(r => r.type === 'exact_match');
    if (exactMatches.length > 0) {
      console.log('✅ YES! Found pattern for 34-byte payloads:');
      exactMatches.forEach(result => {
        console.log(`   🎯 Payload: ${JSON.stringify(result.payload)}`);
        console.log(`   📊 Items: ${result.itemCount}`);
      });
    } else {
      console.log('❌ No clear pattern found for 34-byte content-length');
    }

    // Question 3: Can we get 200+ data entries?
    console.log('\n❓ 3. CAN WE GET 200+ DATA ENTRIES?');
    const totalItems = Math.max(...this.results.map(r => r.itemCount || 0));
    if (totalItems > 200) {
      console.log(`✅ YES! Found ${totalItems} items - exceeding 200!`);
    } else {
      console.log(`❌ Current maximum found: ${totalItems} items (need ${200 - totalItems} more)`);
    }

    // Question 4: Are you using an API key?
    console.log('\n❓ 4. ARE YOU USING AN API KEY?');
    const apiKeyHints = this.results.filter(r => r.type === 'api_key_hint');
    if (apiKeyHints.length > 0) {
      console.log('🔐 API KEY MIGHT BE REQUIRED:');
      apiKeyHints.forEach(result => {
        console.log(`   🔑 ${result.header} header returned status ${result.statusCode}`);
      });
      console.log('💡 Try obtaining an API key from the website for unlimited access');
    } else {
      console.log('✅ NO API KEY REQUIRED - current approach should work');
    }

    // Question 5: Main source recommendation
    console.log('\n❓ 5. MAIN SOURCE RECOMMENDATION');
    if (moreDataResults.length > 0) {
      const best = moreDataResults.reduce((max, current) => 
        current.itemCount > max.itemCount ? current : max
      );
      console.log(`🎯 RECOMMENDED: Use ${best.endpoint} for ${best.itemCount} items`);
    } else {
      console.log('💡 RECOMMENDATION: Current endpoint is likely the main source');
      console.log('   Try different payload combinations for pagination');
    }

    console.log('\n🎉 FINAL SUMMARY:');
    console.log(`📊 Total API tests performed: ${this.results.length}`);
    console.log(`🎯 Current best: ${totalItems} items`);
    console.log(`📈 Success rate: ${totalItems > 192 ? 'EXCEEDED TARGET' : Math.round((totalItems/200)*100) + '% of 200 goal'}`);
  }

  async run() {
    console.log('🚀 Quick API Analysis for ZetaCAD');
    console.log('🎯 Answering: More endpoints? API keys? 200+ data? Main source?');
    console.log('=' * 60 + '\n');
    
    await this.analyzeCurrentAPI();
    await this.discoverMoreEndpoints();
    await this.testAPIKeyUsage();
    await this.checkPaginationLimits();
    await this.generateReport();
  }
}

// Run immediately
if (require.main === module) {
  const analyzer = new QuickAPIAnalyzer();
  analyzer.run().catch(console.error);
}