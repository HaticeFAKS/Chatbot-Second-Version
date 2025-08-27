const fs = require('fs');
const path = require('path');

class ZetaCADHybridScraper {
  constructor() {
    this.knowledgeBase = [];
    this.processedIds = new Set();
  }

  // Extract content from HTML file (like the one you provided)
  extractFromHtmlFile(htmlFilePath) {
    try {
      console.log('📂 Reading HTML file:', htmlFilePath);
      const html = fs.readFileSync(htmlFilePath, 'utf8');
      
      // Extract title from the HTML
      let title = '';
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim().replace(/\s*\|\s*Dipos.*$/i, '').trim();
      }
      
      // Extract main content while preserving HTML structure
      let htmlContent = this.extractMainContent(html);
      
      if (htmlContent && htmlContent.length > 100) {
        const item = {
          id: 'zetacad-akademi-example-' + Date.now(),
          title: title || 'ZetaCAD Akademi İçeriği',
          content: htmlContent,
          transcript: '',
          images: this.extractImagesFromHtml(htmlContent)
        };
        
        this.knowledgeBase.push(item);
        console.log('✅ Extracted content from HTML file');
        console.log(`📏 Content length: ${htmlContent.length} characters`);
        console.log(`🖼️ Images found: ${item.images.length}`);
        
        return item;
      }
      
    } catch (error) {
      console.error('❌ Error reading HTML file:', error);
    }
    
    return null;
  }

  // Extract main content from HTML while preserving structure
  extractMainContent(html) {
    try {
      // Look for main content containers that would be relevant for chat display
      const contentPatterns = [
        // Main container content
        /<div[^>]*class="[^"]*container[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        // Main element
        /<main[^>]*>([\s\S]*?)<\/main>/gi,
        // Article content
        /<article[^>]*>([\s\S]*?)<\/article>/gi,
        // Content sections
        /<section[^>]*>([\s\S]*?)<\/section>/gi,
        // Specific content divs
        /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
      ];
      
      let bestContent = '';
      let bestLength = 0;
      
      // Try each pattern and find the best content
      for (const pattern of contentPatterns) {
        const matches = [...html.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && match[1].length > bestLength) {
            const cleaned = this.cleanHtmlForChat(match[1]);
            if (cleaned.length > 200 && cleaned.length > bestLength) {
              bestContent = cleaned;
              bestLength = cleaned.length;
            }
          }
        });
      }
      
      // If no good content found, try body but remove navigation
      if (!bestContent || bestLength < 300) {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          bestContent = this.cleanHtmlForChat(bodyMatch[1]);
        }
      }
      
      return bestContent;
      
    } catch (error) {
      console.error('Error extracting main content:', error);
      return '';
    }
  }

  // Clean HTML for chat display while preserving useful structure
  cleanHtmlForChat(html) {
    return html
      // Remove navigation and non-content elements
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      
      // Remove scripts, styles, and comments
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/gi, '')
      
      // Remove meta and link tags
      .replace(/<meta[^>]*>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      
      // Clean up form elements that won't work in chat
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
      .replace(/<input[^>]*>/gi, '')
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
      
      // Keep useful HTML elements for formatting
      // h1-h6, p, div, span, strong, em, ul, ol, li, br, img, a
      
      // Clean up excessive whitespace but preserve structure
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  // Extract images from HTML content
  extractImagesFromHtml(html) {
    const images = [];
    const imgMatches = html.match(/<img[^>]+src="([^"]+)"/gi);
    
    if (imgMatches) {
      imgMatches.forEach(match => {
        const srcMatch = match.match(/src="([^"]+)"/i);
        if (srcMatch && srcMatch[1]) {
          let src = srcMatch[1];
          // Convert relative URLs to absolute
          if (src.startsWith('/')) {
            src = 'https://www.dipos.com.tr' + src;
          }
          // Only include real images, not icons or logos
          if (!src.includes('logo') && !src.includes('icon') && 
              (src.includes('.png') || src.includes('.jpg') || src.includes('.jpeg') || src.includes('.gif'))) {
            images.push(src);
          }
        }
      });
    }
    
    return [...new Set(images)].slice(0, 4); // Remove duplicates and limit to 4
  }

  // Generate comprehensive sample content based on ZetaCAD features
  generateComprehensiveSampleContent() {
    console.log('📝 Generating comprehensive ZetaCAD content...');
    
    const sampleContent = [
      {
        id: 'zetacad-proje-olusturma',
        title: 'ZetaCAD\'de Yeni Proje Oluşturma',
        content: `<div class="akademi-content">
          <h2>Yeni Proje Oluşturma</h2>
          <p><strong>Adım 1:</strong> ZetaCAD programını açtıktan sonra <em>Dosya</em> menüsünden <strong>"Yeni Proje"</strong> seçeneğine tıklayın.</p>
          <p><strong>Adım 2:</strong> Açılan pencerede proje bilgilerini doldurun:</p>
          <ul>
            <li>Proje adı ve açıklaması</li>
            <li>Müşteri firma bilgileri</li>
            <li>Proje adresi ve koordinatları</li>
            <li>Gaz dağıtım firması seçimi</li>
          </ul>
          <p><strong>Adım 3:</strong> Proje tipini seçin (Daire İçi, Kolon, Endüstriyel)</p>
          <p><strong>Not:</strong> Bölge seçimi proje onay sürecinde kritik öneme sahiptir.</p>
        </div>`,
        transcript: 'ZetaCAD\'de proje oluşturma süreci hakkında detaylı bilgi.',
        images: [
          'https://raw.githubusercontent.com/zetacad/docs/main/images/yeni-proje-001.png',
          'https://raw.githubusercontent.com/zetacad/docs/main/images/yeni-proje-002.png'
        ]
      },
      {
        id: 'tesisat-cizim-araclari',
        title: 'Tesisat Çizim Araçları Kullanımı',
        content: `<div class="akademi-content">
          <h2>Tesisat Çizim Araçları</h2>
          <h3>Temel Çizim Araçları</h3>
          <p>Sol taraftaki araç çubuğunda bulunan temel araçlar:</p>
          <ul>
            <li><strong>Boru Aracı:</strong> Tesisat hatlarını çizmek için</li>
            <li><strong>Cihaz Aracı:</strong> Kombiler, kazanlar vb. cihazları yerleştirmek için</li>
            <li><strong>Vana Aracı:</strong> Kesme ve kontrol vanaları için</li>
            <li><strong>Sayaç Aracı:</strong> Gaz sayaçlarını yerleştirmek için</li>
          </ul>
          <h3>3D Çizim İpuçları</h3>
          <p>3 boyutlu sahnede çizim yaparken:</p>
          <ul>
            <li>Kamera açısını <kbd>Ctrl+Shift</kbd> ile kontrol edin</li>
            <li>Grid sistemi ile düzenli çizim yapın</li>
            <li>Yükseklik kotlarını doğru girin</li>
          </ul>
        </div>`,
        transcript: 'Tesisat çizim araçlarının kullanımı ve 3D çizim teknikleri.',
        images: []
      },
      {
        id: 'hata-kontrol-cozumleri',
        title: 'Hata Kontrolleri ve Çözüm Yöntemleri',
        content: `<div class="akademi-content">
          <h2>Hata Kontrolleri</h2>
          <p><kbd>F1</kbd> tuşu ile hata kontrol panelini açabilirsiniz.</p>
          
          <h3>Hata Türleri</h3>
          <div class="error-types">
            <h4 style="color: #dc3545;">🔴 Kırmızı Hatalar</h4>
            <p>Mutlaka düzeltilmesi gereken kritik hatalar:</p>
            <ul>
              <li>Birim sınırı hataları</li>
              <li>Çap hesaplama hataları</li>
              <li>Basınç kayıp limit aşımları</li>
            </ul>
            
            <h4 style="color: #ffc107;">🟡 Sarı Uyarılar</h4>
            <p>Dikkat edilmesi gereken durumlar:</p>
            <ul>
              <li>Optimizasyon önerileri</li>
              <li>Güvenlik mesafeleri</li>
              <li>Cihaz verim değerleri</li>
            </ul>
            
            <h4>⚫ Siyah Bilgiler</h4>
            <p>Bilgilendirme amaçlı mesajlar - gönderimi engellemeyen uyarılar.</p>
          </div>
          
          <h3>Yaygın Hataların Çözümleri</h3>
          <p><strong>Access Violation Hatası:</strong> Bodrum/üst kat kontrolü yapın</p>
          <p><strong>Birim Sınırı Hatası:</strong> Dubleks antre tanımlamalarını kontrol edin</p>
        </div>`,
        transcript: 'Hata kontrol paneli kullanımı ve yaygın hataların çözümleri.',
        images: [
          'https://raw.githubusercontent.com/zetacad/docs/main/images/hata-panel-001.png'
        ]
      }
    ];
    
    // Add more technical content
    const technicalContent = [
      {
        id: 'cap-hesaplamalari-detay',
        title: 'Çap Hesaplamaları ve Optimizasyon',
        content: `<div class="akademi-content">
          <h2>Çap Hesaplamaları</h2>
          <p><strong>Otomatik Hesaplama:</strong> <em>Araçlar > Çap Hesapla</em> menüsünden</p>
          
          <h3>Hesaplama Kriterleri</h3>
          <table style="border: 1px solid #ddd; width: 100%;">
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; border: 1px solid #ddd;">Çap (mm)</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Max Debi (m³/h)</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Hız Limiti (m/s)</th>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">DN20</td>
              <td style="padding: 8px; border: 1px solid #ddd;">6</td>
              <td style="padding: 8px; border: 1px solid #ddd;">20</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">DN25</td>
              <td style="padding: 8px; border: 1px solid #ddd;">10</td>
              <td style="padding: 8px; border: 1px solid #ddd;">20</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">DN32</td>
              <td style="padding: 8px; border: 1px solid #ddd;">16</td>
              <td style="padding: 8px; border: 1px solid #ddd;">20</td>
            </tr>
          </table>
          
          <p><strong>⚠️ Dikkat:</strong> Basınç kayıp limitleri aşılmamalı</p>
        </div>`,
        transcript: 'Çap hesaplama kriterleri ve optimizasyon teknikleri.',
        images: []
      },
      {
        id: 'dipos-sistem-entegrasyonu',
        title: 'DIPOS Sistem Entegrasyonu',
        content: `<div class="akademi-content">
          <h2>DIPOS Sistemi ile Çalışma</h2>
          
          <h3>Proje Gönderim Süreci</h3>
          <ol>
            <li><strong>İmzalı Kayıt:</strong> E-imza ile projeyi kaydedin</li>
            <li><strong>Evrak Yükleme:</strong> Gerekli evrakları sisteme yükleyin</li>
            <li><strong>Poliçe Tanımlama:</strong> Sigorta poliçesini tanımlayın</li>
            <li><strong>Gönderim:</strong> Proje kontrolünden sonra gönderin</li>
          </ol>
          
          <h3>Gaz Açma Randevuları</h3>
          <p>Dijital gaz açma sistemi üzerinden:</p>
          <ul>
            <li>Randevu talep etme</li>
            <li>Randevu durumu takibi</li>
            <li>Evrak yükleme işlemleri</li>
          </ul>
          
          <p><strong>Not:</strong> AKSA ve ENERYA bölgeleri kendi sistemlerini kullanır</p>
        </div>`,
        transcript: 'DIPOS sistemi ile entegrasyon ve proje gönderim süreçleri.',
        images: []
      }
    ];
    
    // Combine all content
    this.knowledgeBase.push(...sampleContent, ...technicalContent);
    
    console.log(`✅ Generated ${this.knowledgeBase.length} comprehensive content items`);
  }

  // Save knowledge base
  async saveKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'zetacad_html_knowledge_base.json');
    
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
        
        // Show sample
        const sample = this.knowledgeBase[0];
        console.log('\n📄 Sample item:');
        console.log(`ID: ${sample.id}`);
        console.log(`Title: ${sample.title}`);
        console.log(`Content preview: ${sample.content.substring(0, 200).replace(/\s+/g, ' ')}...`);
      }
      
      console.log('\n🎉 HTML Knowledge base ready for chatbot!');
      console.log('💡 Content includes properly formatted HTML for chat display.');
      
    } catch (error) {
      console.error('❌ Error saving knowledge base:', error);
    }
  }

  // Main execution function
  async run() {
    console.log('🚀 ZetaCAD Hybrid Content Generator');
    console.log('📝 Creating comprehensive knowledge base with HTML formatting for chat\n');
    
    // Try to extract from HTML file if it exists
    const htmlFilePath = path.join(__dirname, '..', 'example.html');
    if (fs.existsSync(htmlFilePath)) {
      this.extractFromHtmlFile(htmlFilePath);
    }
    
    // Generate comprehensive sample content
    this.generateComprehensiveSampleContent();
    
    // Save the knowledge base
    await this.saveKnowledgeBase();
    
    console.log('\n✨ Process completed!');
    console.log('🔄 You can now use this knowledge base in your chatbot');
    console.log('💬 The HTML content will display correctly in chat messages');
  }
}

// Export and run
module.exports = ZetaCADHybridScraper;

if (require.main === module) {
  const scraper = new ZetaCADHybridScraper();
  scraper.run();
}