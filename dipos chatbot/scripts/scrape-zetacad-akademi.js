const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ZetaCADAkademiScraper {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.akademiUrl = 'https://www.dipos.com.tr/zetacad/akademi';
    this.knowledgeBase = [];
    this.processedUrls = new Set();
  }

  async init() {
    this.browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid being blocked
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async extractPageContent(url) {
    try {
      console.log(`Extracting content from: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for content to load
      await this.page.waitForTimeout(2000);

      const content = await this.page.evaluate(() => {
        // Function to clean and extract text content
        function cleanText(element) {
          if (!element) return '';
          
          // Remove script and style elements
          const scripts = element.querySelectorAll('script, style, noscript');
          scripts.forEach(el => el.remove());
          
          // Get text content and clean it
          let text = element.textContent || element.innerText || '';
          
          // Clean up whitespace and special characters
          text = text.replace(/\s+/g, ' ')
                    .replace(/[\n\r\t]/g, ' ')
                    .trim();
          
          return text;
        }

        // Extract title
        let title = '';
        const titleSelectors = [
          'h1',
          '.title',
          '[data-title]',
          'title'
        ];
        
        for (const selector of titleSelectors) {
          const titleEl = document.querySelector(selector);
          if (titleEl && titleEl.textContent.trim()) {
            title = titleEl.textContent.trim();
            break;
          }
        }

        // Extract main content
        let mainContent = '';
        
        // Try different content selectors based on the HTML structure
        const contentSelectors = [
          '.container .flex.flex-col',
          'main',
          '.content',
          'article',
          '.akademi-content',
          '.page-content'
        ];
        
        for (const selector of contentSelectors) {
          const contentEl = document.querySelector(selector);
          if (contentEl) {
            mainContent = cleanText(contentEl);
            if (mainContent.length > 100) {
              break;
            }
          }
        }
        
        // If no specific content found, get body content but filter out navigation
        if (!mainContent || mainContent.length < 100) {
          const body = document.body.cloneNode(true);
          
          // Remove navigation, header, footer elements
          const removeSelectors = [
            'nav', 'header', 'footer', 
            '.nav', '.navigation', '.menu',
            '.header', '.footer', 
            '.sidebar', '.breadcrumb'
          ];
          
          removeSelectors.forEach(sel => {
            const elements = body.querySelectorAll(sel);
            elements.forEach(el => el.remove());
          });
          
          mainContent = cleanText(body);
        }

        // Extract any images
        const images = [];
        const imgElements = document.querySelectorAll('img[src]');
        imgElements.forEach(img => {
          let src = img.src;
          if (src && !src.includes('logo') && !src.includes('icon')) {
            // Convert relative URLs to absolute
            if (src.startsWith('/')) {
              src = 'https://www.dipos.com.tr' + src;
            }
            images.push(src);
          }
        });

        return {
          title: title,
          content: mainContent,
          images: images,
          url: window.location.href
        };
      });

      return content;
      
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error.message);
      return null;
    }
  }

  async findAkademiPages() {
    try {
      console.log('Finding all akademi pages...');
      await this.page.goto(this.akademiUrl, { waitUntil: 'networkidle0' });
      
      // Extract all akademi page links
      const pageLinks = await this.page.evaluate(() => {
        const links = [];
        const linkElements = document.querySelectorAll('a[href*="/zetacad/akademi/yazi/"]');
        
        linkElements.forEach(link => {
          const href = link.href;
          if (href && !links.includes(href)) {
            links.push(href);
          }
        });
        
        // Also check for any pagination or "load more" functionality
        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(link => {
          const href = link.href;
          if (href && href.includes('/zetacad/akademi/') && !links.includes(href)) {
            links.push(href);
          }
        });
        
        return [...new Set(links)]; // Remove duplicates
      });

      console.log(`Found ${pageLinks.length} akademi pages`);
      return pageLinks;
      
    } catch (error) {
      console.error('Error finding akademi pages:', error);
      return [];
    }
  }

  async scrapeAllPages() {
    console.log('Starting ZetaCAD Akademi scraping...');
    
    const pageLinks = await this.findAkademiPages();
    
    if (pageLinks.length === 0) {
      console.log('No pages found, trying alternative method...');
      // Fallback: try to find pages through sitemap or different approach
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < pageLinks.length; i++) {
      const url = pageLinks[i];
      
      if (this.processedUrls.has(url)) {
        continue;
      }

      try {
        const content = await this.extractPageContent(url);
        
        if (content && content.content && content.content.length > 50) {
          // Create a unique ID from the URL
          const urlParts = url.split('/');
          const id = urlParts[urlParts.length - 1] || `page-${i + 1}`;
          
          // Clean and prepare the content
          const knowledgeItem = {
            id: id,
            title: content.title || `ZetaCAD Akademi - ${id}`,
            content: content.content.substring(0, 5000), // Limit content length
            transcript: "", // Empty as per your original structure
            images: content.images || []
          };

          this.knowledgeBase.push(knowledgeItem);
          this.processedUrls.add(url);
          successCount++;
          
          console.log(`✅ Processed ${successCount}/${pageLinks.length}: ${content.title}`);
        } else {
          errorCount++;
          console.log(`❌ Failed to extract content from: ${url}`);
        }
        
        // Add delay to avoid being rate limited
        await this.page.waitForTimeout(1000 + Math.random() * 2000);
        
      } catch (error) {
        errorCount++;
        console.error(`Error processing ${url}:`, error.message);
      }
    }

    console.log(`\n📊 Scraping completed:`);
    console.log(`✅ Success: ${successCount} pages`);
    console.log(`❌ Errors: ${errorCount} pages`);
    console.log(`📄 Total knowledge base items: ${this.knowledgeBase.length}`);
  }

  async saveKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'zetacad_akademi_knowledge_base.json');
    
    try {
      await fs.promises.writeFile(
        outputPath, 
        JSON.stringify(this.knowledgeBase, null, 2), 
        'utf8'
      );
      console.log(`💾 Knowledge base saved to: ${outputPath}`);
      console.log(`📊 Total items: ${this.knowledgeBase.length}`);
      
      // Also save a summary
      const summary = {
        totalItems: this.knowledgeBase.length,
        generatedAt: new Date().toISOString(),
        source: 'ZetaCAD Akademi',
        baseUrl: this.baseUrl,
        sampleItems: this.knowledgeBase.slice(0, 3).map(item => ({
          id: item.id,
          title: item.title,
          contentLength: item.content.length
        }))
      };
      
      const summaryPath = path.join(__dirname, '..', 'scraping_summary.json');
      await fs.promises.writeFile(
        summaryPath, 
        JSON.stringify(summary, null, 2), 
        'utf8'
      );
      
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.init();
      await this.scrapeAllPages();
      await this.saveKnowledgeBase();
    } catch (error) {
      console.error('Scraping failed:', error);
    } finally {
      await this.close();
    }
  }
}

// Run the scraper
async function main() {
  const scraper = new ZetaCADAkademiScraper();
  await scraper.run();
}

// Export for use as module
module.exports = ZetaCADAkademiScraper;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}