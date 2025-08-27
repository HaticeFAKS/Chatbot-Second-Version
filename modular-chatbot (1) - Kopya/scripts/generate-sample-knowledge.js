const fs = require('fs');
const path = require('path');

class SimpleZetaCADScraper {
  constructor() {
    this.baseUrl = 'https://www.dipos.com.tr';
    this.knowledgeBase = [];
    this.processedPages = 0;
  }

  // This function is not needed for sample data generation
  // We'll generate sample content instead of scraping

  // Extract content from HTML string
  extractContent(html, url) {
    try {
      // Simple regex-based content extraction
      let title = '';
      let content = '';
      
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = this.cleanText(titleMatch[1]);
      }
      
      // Try to find main content areas
      const contentPatterns = [
        /<main[^>]*>(.*?)<\/main>/gis,
        /<article[^>]*>(.*?)<\/article>/gis,
        /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/gis,
        /<div[^>]*class="[^"]*container[^"]*"[^>]*>(.*?)<\/div>/gis
      ];
      
      for (const pattern of contentPatterns) {
        const matches = html.match(pattern);
        if (matches && matches[0]) {
          content = matches[0];
          break;
        }
      }
      
      // If no specific content found, extract from body
      if (!content) {
        const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/gis);
        if (bodyMatch) {
          content = bodyMatch[0];
        }
      }
      
      // Clean HTML tags and extract text
      content = this.stripHtml(content);
      content = this.cleanText(content);
      
      // Extract images
      const images = [];
      const imgMatches = html.match(/<img[^>]+src="([^"]+)"/gi);
      if (imgMatches) {
        imgMatches.forEach(match => {
          const srcMatch = match.match(/src="([^"]+)"/i);
          if (srcMatch) {
            let src = srcMatch[1];
            if (src.startsWith('/')) {
              src = this.baseUrl + src;
            }
            if (!src.includes('logo') && !src.includes('icon')) {
              images.push(src);
            }
          }
        });
      }

      return {
        title: title || 'ZetaCAD Akademi İçeriği',
        content: content.substring(0, 4000), // Limit content
        images: [...new Set(images)] // Remove duplicates
      };
      
    } catch (error) {
      console.error('Error extracting content:', error);
      return null;
    }
  }

  // Remove HTML tags
  stripHtml(html) {
    return html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
      .replace(/<header[^>]*>.*?<\/header>/gis, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
      .replace(/<[^>]+>/g, ' ');
  }

  // Clean text content
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\n\r\t]/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Generate sample ZetaCAD Akademi content
  async generateSampleKnowledgeBase() {
    console.log('Generating sample ZetaCAD Akademi knowledge base...');
    
    // Sample akademi topics based on ZetaCAD features
    const sampleTopics = [
      {
        id: "zetacad-giris",
        title: "ZetaCAD'e Giriş ve Temel Kullanım",
        content: "ZetaCAD, gaz tesisatı projelerinin tasarımı için geliştirilmiş profesyonel bir CAD yazılımıdır. Program ile 2D ve 3D ortamda tesisat çizimleri yapabilir, hesaplamalar gerçekleştirebilir ve proje dokümantasyonlarını hazırlayabilirsiniz. İlk açılışta kullanıcı adı ve şifre ile giriş yapmanız gerekmektedir."
      },
      {
        id: "proje-olusturma",
        title: "Yeni Proje Oluşturma",
        content: "Yeni proje oluşturmak için 'Dosya' menüsünden 'Yeni Proje' seçeneğini kullanın. Proje bilgilerini eksiksiz doldurun: proje adı, müşteri bilgileri, adres bilgileri ve teknik özellikler. Bu bilgiler raporlarda ve evraklarda kullanılacaktır."
      },
      {
        id: "tesisat-cizimi",
        title: "Tesisat Çizimi Teknikleri",
        content: "Tesisat çizimi için sol taraftaki araç çubuğundan uygun aracı seçin. Boru çizimi için 'Boru' aracını, cihaz yerleştirme için 'Cihaz' aracını kullanın. Çizim yaparken ölçülere dikkat edin ve doğru kotlarda çizim yapın. 3D görünümde çizimin kontrolünü yapabilirsiniz."
      },
      {
        id: "cihaz-ekleme",
        title: "Cihaz Ekleme ve Özellik Tanımlama",
        content: "Cihaz eklemek için 'Cihaz' aracını seçin ve uygun yere tıklayın. Eklenen cihaza sağ tıklayarak özellikler penceresini açın. Cihaz markası, modeli, kapasitesi gibi bilgileri doğru şekilde girin. Bu bilgiler hesaplamalarda kullanılır."
      },
      {
        id: "cap-hesaplamalari",
        title: "Çap Hesaplamaları",
        content: "Boru çaplarını hesaplamak için 'Araçlar' menüsünden 'Çap Hesapla' seçeneğini kullanın. Program, tüketim değerlerine göre otomatik çap hesaplaması yapar. Hesaplama sonucunda uygun olmayan çaplar kırmızı renkte gösterilir ve düzeltilmelidir."
      },
      {
        id: "mimari-plan",
        title: "Mimari Plan Hazırlama",
        content: "Mimari plan çizmek için 'Mimari' sekmesine geçin. Duvar aracı ile duvarları çizin, kapı ve pencere araçları ile açıklıkları yerleştirin. Oda aracı ile mahalleri tanımlayın ve isimlendirin. Mimari plan tesisat çiziminin temelini oluşturur."
      },
      {
        id: "hata-kontrolu",
        title: "Hata Kontrolleri",
        content: "Çizim tamamlandıktan sonra 'F1' tuşu ile hata kontrol panelini açın. Kırmızı hatalar mutlaka giderilmelidir. Sarı uyarılar dikkat edilmesi gereken noktalardır. Hataları tek tek kontrol ederek düzeltin ve tekrar kontrol edin."
      },
      {
        id: "izometrik-goruntuleme",
        title: "İzometrik Görüntüleme",
        content: "İzometrik görünüm için 'İzometrik' sekmesine geçin. Bu görünümde tesisatın 3 boyutlu halini görebilirsiniz. Çakışmaları ve hataları daha kolay fark edebilirsiniz. İzometrik planı yazdırabilir ve projeye ekleyebilirsiniz."
      },
      {
        id: "malzeme-listesi",
        title: "Malzeme Listesi Oluşturma",
        content: "Projenin malzeme listesini çıkarmak için 'Raporlar' menüsünden 'Malzeme Listesi' seçeneğini kullanın. Liste, çizimde kullanılan tüm boru, ek parça ve cihazları içerir. Listeyi Excel formatında kaydedebilirsiniz."
      },
      {
        id: "proje-kaydetme",
        title: "Proje Kaydetme ve Yedekleme",
        content: "Projeyi kaydetmek için 'Ctrl+S' kısayolunu kullanın veya 'Dosya' menüsünden 'Kaydet' seçeneğini seçin. Düzenli aralıklarla yedek alın. Proje dosyalarını güvenli bir konumda saklayın."
      },
      {
        id: "pdf-cikti",
        title: "PDF Çıktısı Alma",
        content: "Planları PDF olarak kaydetmek için 'Dosya' menüsünden 'PDF'e Aktar' seçeneğini kullanın. Yazdırma ayarlarını kontrol edin: kağıt boyutu, ölçek, plan seçimi. Çıktı kalitesini 'Yüksek' olarak ayarlayın."
      },
      {
        id: "katlar-yonetimi",
        title: "Katlar Yönetimi",
        content: "Çok katlı projelerde katlar panelini kullanın. Yeni kat eklemek için 'Kat Ekle' butonunu kullanın. Kat isimlerini düzenleyin ve yüksekliklerini doğru girin. Katlar arası geçiş için kat listesini kullanın."
      },
      {
        id: "garaj-tesisat",
        title: "Garaj Tesisatı Çizimi",
        content: "Garaj tesisatı için özel dikkat edilmesi gereken noktalar vardır. Havalandırma sistemi mutlaka eklenmelidir. CO sensörü konumlandırması önemlidir. Acil durum vanası erişilebilir yerde olmalıdır."
      },
      {
        id: "dubleks-daire",
        title: "Dubleks Daire Projesi",
        content: "Dubleks dairelerde katlar arası bağlantıyı doğru çizin. Alt ve üst kat tesisatını birleştirin. Kat yüksekliklerini doğru girin. Kolon tesisatı bağlantılarını kontrol edin."
      },
      {
        id: "endüstriyel-tesisat",
        title: "Endüstriyel Tesisat Hesaplamaları",
        content: "Endüstriyel tesisatlarda yüksek debili cihazlar kullanılır. Basınç kayıplarını dikkatli hesaplayın. Regülatör seçimi önemlidir. Güvenlik donanımlarını eksik bırakmayın."
      },
      {
        id: "baca-cizimi",
        title: "Baca Çizimi ve Hesaplamaları",
        content: "Baca çizimi için baca aracını kullanın. Baca yüksekliğini ve çapını doğru hesaplayın. Kaskat (çoklu) baca sistemlerinde dikkatli olun. Baca yalıtımını unutmayın."
      },
      {
        id: "kolon-tesisat",
        title: "Kolon Tesisatı Tasarımı",
        content: "Kolon tesisatı tüm binayi besleyen ana sistimdir. Servis kutusundan başlayarak tüm dairelere dağıtım yapın. Çap hesaplamalarını dikkatli yapın. Branşman noktalarını doğru konumlandırın."
      },
      {
        id: "sayac-konumlari",
        title: "Sayaç Konumlandırma",
        content: "Sayaçları erişilebilir yerlere yerleştirin. Sayaç dolabı boyutlarına dikkat edin. Her birim için ayrı sayaç gereklidir. Sayaç numaralarını doğru girin."
      },
      {
        id: "vana-yerlesimi",
        title: "Vana Yerleşimi",
        content: "Kesme vanalarını stratejik noktalara yerleştirin. Ana kesme vanası binaya girişte olmalıdır. Her birim için ayrı kesme vanası ekleyin. Vanalar erişilebilir yerlerde olmalıdır."
      },
      {
        id: "hesaplama-kontrolleri",
        title: "Hesaplama Kontrolleri",
        content: "Basınç hesaplamalarını kontrol edin. Debi hesaplamalarını doğrulayın. Çap seçimlerinin uygunluğunu kontrol edin. Hız değerlerinin sınırlar içinde olduğunu kontrol edin."
      }
    ];

    // Generate the knowledge base
    sampleTopics.forEach((topic, index) => {
      this.knowledgeBase.push({
        id: topic.id,
        title: topic.title,
        content: topic.content,
        transcript: "",
        images: []
      });
    });

    this.processedPages = sampleTopics.length;
    console.log(`Generated ${this.processedPages} sample knowledge base items`);
  }

  async saveKnowledgeBase() {
    const outputPath = path.join(__dirname, '..', 'zetacad_akademi_knowledge_base.json');
    
    try {
      fs.writeFileSync(
        outputPath, 
        JSON.stringify(this.knowledgeBase, null, 2), 
        'utf8'
      );
      console.log(`💾 Knowledge base saved to: ${outputPath}`);
      console.log(`📊 Total items: ${this.knowledgeBase.length}`);
      
      // Show sample items
      console.log('\n📄 Sample items:');
      this.knowledgeBase.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.content.length} chars)`);
      });
      
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting ZetaCAD Akademi Knowledge Base Generation...');
      await this.generateSampleKnowledgeBase();
      await this.saveKnowledgeBase();
      console.log('✅ Knowledge base generation completed!');
    } catch (error) {
      console.error('❌ Generation failed:', error);
    }
  }
}

// Run the scraper
async function main() {
  const scraper = new SimpleZetaCADScraper();
  await scraper.run();
}

// Export for use as module
module.exports = SimpleZetaCADScraper;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}