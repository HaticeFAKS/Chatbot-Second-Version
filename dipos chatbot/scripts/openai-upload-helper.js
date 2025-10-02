const fs = require('fs');
const path = require('path');

class OpenAIUploadHelper {
  constructor() {
    this.knowledgeBasePath = path.join(__dirname, '..', 'zetacad_enhanced_knowledge_base_2025-08-27T11-56-41.json');
  }

  // Prepare knowledge base for OpenAI upload
  prepareForOpenAI() {
    console.log('📊 Analyzing knowledge base for OpenAI compatibility...\n');
    
    try {
      const data = JSON.parse(fs.readFileSync(this.knowledgeBasePath, 'utf8'));
      
      console.log(`📄 Total items: ${data.length}`);
      console.log(`📏 File size: ${(fs.statSync(this.knowledgeBasePath).size / 1024 / 1024).toFixed(2)} MB`);
      
      // Check OpenAI limits
      const fileSizeMB = fs.statSync(this.knowledgeBasePath).size / 1024 / 1024;
      const maxSizeMB = 512; // OpenAI file upload limit
      
      if (fileSizeMB > maxSizeMB) {
        console.log(`⚠️ File size (${fileSizeMB.toFixed(2)}MB) exceeds OpenAI limit (${maxSizeMB}MB)`);
        console.log('💡 Suggestion: Split into smaller chunks or compress content');
        this.createSplitFiles(data);
      } else {
        console.log(`✅ File size OK for OpenAI upload`);
      }
      
      // Analyze content for OpenAI optimization
      this.analyzeContent(data);
      
      // Create OpenAI-optimized version
      this.createOpenAIOptimized(data);
      
    } catch (error) {
      console.error('❌ Error analyzing knowledge base:', error.message);
    }
  }

  analyzeContent(data) {
    console.log('\n🔍 Content Analysis:');
    
    const totalContent = data.reduce((sum, item) => sum + (item.content?.length || 0), 0);
    const avgContentLength = Math.round(totalContent / data.length);
    const maxContentLength = Math.max(...data.map(item => item.content?.length || 0));
    
    console.log(`📊 Total content: ${(totalContent / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📏 Average item length: ${avgContentLength.toLocaleString()} chars`);
    console.log(`📈 Max item length: ${maxContentLength.toLocaleString()} chars`);
    
    // Count multimedia content
    const itemsWithImages = data.filter(item => item.images?.length > 0).length;
    const itemsWithVideos = data.filter(item => item.content?.includes('iframe')).length;
    const itemsWithLinks = data.filter(item => item.content?.includes('<a ')).length;
    
    console.log(`🖼️ Items with images: ${itemsWithImages}`);
    console.log(`📺 Items with videos: ${itemsWithVideos}`);
    console.log(`🔗 Items with links: ${itemsWithLinks}`);
  }

  createSplitFiles(data) {
    console.log('\n✂️ Creating split files for OpenAI upload...');
    
    const chunkSize = 50; // Items per chunk
    const chunks = [];
    
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    chunks.forEach((chunk, index) => {
      const filename = `zetacad_kb_part_${index + 1}_of_${chunks.length}.json`;
      const filepath = path.join(__dirname, '..', filename);
      
      fs.writeFileSync(filepath, JSON.stringify(chunk, null, 2));
      const sizeMB = (fs.statSync(filepath).size / 1024 / 1024).toFixed(2);
      
      console.log(`📁 Created: ${filename} (${chunk.length} items, ${sizeMB}MB)`);
    });
  }

  createOpenAIOptimized(data) {
    console.log('\n🎯 Creating OpenAI-optimized version...');
    
    const optimized = data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      // Keep essential metadata only
      images: item.images?.slice(0, 3), // Limit images
      summary: item.transcript || item.content?.substring(0, 200) + '...',
      category: item.originalData?.category || 'zetacad-tutorial',
      keywords: this.extractKeywords(item.title + ' ' + item.content)
    }));
    
    const outputPath = path.join(__dirname, '..', 'zetacad_openai_optimized.json');
    fs.writeFileSync(outputPath, JSON.stringify(optimized, null, 2));
    
    const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
    console.log(`✅ Created optimized version: ${sizeMB}MB`);
    console.log(`📁 File: zetacad_openai_optimized.json`);
  }

  extractKeywords(text) {
    if (!text) return [];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const freq = {};
    words.forEach(word => freq[word] = (freq[word] || 0) + 1);
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  generateUploadInstructions() {
    console.log('\n📋 OpenAI Upload Instructions:\n');
    
    console.log('🎯 METHOD 1: Custom GPT (Easiest)');
    console.log('1. Go to chat.openai.com');
    console.log('2. Click "Explore" → "Create a GPT"');
    console.log('3. Upload your JSON file in "Knowledge" section');
    console.log('4. Add instructions: "You are a ZetaCAD tutorial assistant..."');
    
    console.log('\n🎯 METHOD 2: Assistants API (Programmatic)');
    console.log('1. Get OpenAI API key from platform.openai.com');
    console.log('2. Upload file:');
    console.log('   curl -X POST https://api.openai.com/v1/files \\');
    console.log('     -H "Authorization: Bearer YOUR_API_KEY" \\');
    console.log('     -H "Content-Type: multipart/form-data" \\');
    console.log('     -F purpose="assistants" \\');
    console.log('     -F file="@zetacad_openai_optimized.json"');
    
    console.log('\n🎯 METHOD 3: Vector Database (Advanced)');
    console.log('1. Use OpenAI Embeddings API');
    console.log('2. Create vector database (Pinecone, Weaviate, etc.)');
    console.log('3. Implement RAG (Retrieval Augmented Generation)');
    
    console.log('\n💡 RECOMMENDED: Start with Custom GPT for simplicity!');
  }

  run() {
    console.log('🚀 OpenAI Upload Helper for ZetaCAD Knowledge Base\n');
    this.prepareForOpenAI();
    this.generateUploadInstructions();
  }
}

// Run the helper
if (require.main === module) {
  const helper = new OpenAIUploadHelper();
  helper.run();
}

module.exports = OpenAIUploadHelper;