# 🤖 ZetaCAD Yapay Zeka Asistanı

## 🎯 Proje Hakkında

ZetaCAD Yapay Zeka Asistanı, mimari tasarım yazılımı ZetaCAD kullanıcıları için geliştirilmiş akıllı bir chatbot uygulamasıdır. OpenAI'ın GPT-4 teknolojisini ve Assistant API'sini kullanan bu asistan, kullanıcılara ZetaCAD yazılımı hakkında detaylı bilgi, çizim teknikleri, proje yönetimi ve problem çözme konularında 7/24 destek sağlar.

### 🎯 Hedef Kitle

- Mimari tasarım öğrencileri
- ZetaCAD kullanıcıları
- Mimarlık büroları
- CAD yazılımı öğrenmek isteyenler

### 🔧 Nasıl Çalışır?

1. **Frontend**: Next.js App Router ile modern React uygulaması
2. **Chat API**: `/api/chat` endpoint'i OpenAI Assistant API'sine bağlanır
3. **Session**: Thread bazlı oturum yönetimi ile sürekli sohbet
4. **Vector Store**: ZetaCAD bilgi bankası için semantik arama
5. **UI**: Embed/Card/Full modlarında çalışabilen esnek arayüzn="center">
   <img src="public/co-pilot.gif" alt="ZetaCAD Asistanı" width="100" height="100">

   **ZetaCAD yazılımı için geliştirilmiş akıllı AI asistanı**

   _Mimari projeleriniz ve ZetaCAD kullanımı için 7/24 destek_

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green?style=flat-square&logo=openai)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 İçindekiler

- [🎯 Proje Hakkında](#-proje-hakkında)
- [✨ Özellikler](#-özellikler)
- [🛠️ Teknolojiler](#️-teknolojiler)
- [⚡ Hızlı Başlangıç](#-hızlı-başlangıç)
- [🔧 Kurulum](#-kurulum)
- [⚙️ Yapılandırma](#️-yapılandırma)
- [📁 Proje Yapısı](#-proje-yapısı)
- [🚀 Deployment](#-deployment)
- [📖 API Dokümantasyonu](#-api-dokümantasyonu)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)

---

## � Proje Hakkında

ZetaCAD Yapay Zeka Asistanı, mimari tasarım yazılımı ZetaCAD kullanıcıları için geliştirilmiş akıllı bir chatbot uygulamasıdır. OpenAI'ın GPT-4 teknolojisini kullanan bu asistan, kullanıcılara ZetaCAD yazılımı hakkında detaylı bilgi, çizim teknikleri, proje yönetimi ve problem çözme konularında 7/24 destek sağlar.

### 🎯 Hedef Kitle

- Mimari tasarım öğrencileri
- ZetaCAD kullanıcıları
- Mimarlık büroları
- CAD yazılımı öğrenmek isteyenler

---

## ✨ Özellikler

### 🧠 Yapay Zeka Özellikleri

- **🎯 ZetaCAD Uzmanı**: 188+ tutorial ve rehber içeren kapsamlı bilgi bankası
- **� Akıllı Sohbet**: Doğal dil işleme ile anlayabilir ve yanıtlar
- **🔍 Akıllı Arama**: Vector Store teknolojisi ile hızlı bilgi erişimi
- **📚 Öğrenme Yetisi**: Sürekli güncellenen bilgi bankası

### 🎨 Kullanıcı Deneyimi

- **🌓 Karanlık/Açık Tema**: Otomatik tema geçişi
- **📱 Responsive Tasarım**: Mobil uyumlu arayüz
- **⭐ Mesaj Değerlendirme**: Yıldız ve beğeni sistemi (thumbs/stars)
- **🎭 Maskot Avatar**: Animasyonlu co-pilot.gif
- **⚡ Embed/Card/Full Mod**: Üç farklı görüntü modu
- **� Thread Takibi**: OpenAI thread sistemi ile sürekli sohbet

### 🛡️ Güvenlik ve Performans

- **🔐 Session Yönetimi**: Güvenli oturum takibi
- **⚡ Hızlı Yanıt**: Optimize edilmiş API çağrıları
- **🌍 Türkçe Destek**: Tam yerelleştirme
- **📊 Analitik**: Kullanım istatistikleri

---

## 🛠️ Teknolojiler

### Frontend

- **⚛️ React 18.3.1** - UI kütüphanesi
- **▲ Next.js 15.2.4** - Full-stack framework
- **📘 TypeScript** - Tip güvenliği
- **🎨 Tailwind CSS** - Utility-first CSS
- **🎪 Radix UI** - Erişilebilir UI bileşenleri
- **🌟 Shadcn/ui** - Modern UI komponenleri

### Backend & AI

- **🤖 OpenAI GPT-4** - Dil modeli
- **🔍 Vector Store** - Semantik arama
- **🗄️ MS SQL Server** - Veritabanı (opsiyonel)
- **🔌 REST API** - Backend servisler

### Geliştirme Araçları

- **📦 NPM** - Paket yöneticisi (package-lock.json)
- **🔧 ESLint** - Kod kalitesi
- **🎯 PostCSS** - CSS işleme
- **⚡ Next.js App Router** - Modern routing

---

## ⚡ Hızlı Başlangıç

```bash
# Depoyu klonlayın
git clone https://github.com/HaticeFAKS/Chatbot-First-Version.git
cd "Chatbot-First-Version/dipos chatbot"

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

🌐 **Tarayıcınızda açın:** http://localhost:3000

---

## 🔧 Kurulum

### Ön Gereksinimler

- **Node.js** 18.0 veya üzeri
- **NPM** (Node.js ile birlikte gelir)
- **OpenAI API Key**
- **OpenAI Assistant ID**
- **OpenAI Vector Store ID**

### Adım Adım Kurulum

1. **Projeyi Klonlayın**

   ```bash
   git clone https://github.com/HaticeFAKS/Chatbot-First-Version.git
   cd "Chatbot-First-Version/dipos chatbot"
   ```

2. **Bağımlılıkları Yükleyin**

   ```bash
   npm install
   ```

3. **Ortam Değişkenlerini Ayarlayın**

   ````bash
   # Mevcut .env dosyasını düzenleyin
   notepad .env

   # Veya .env.local dosyası oluşturup gizli bilgileri orada tutun (önerilen)
   copy .env .env.local
   notepad .env.local
   ```4. **Geliştirme Sunucusunu Başlatın**
   ```bash
   npm run dev
   ````

---

## ⚙️ Yapılandırma

`.env` dosyasında aşağıdaki değişkenleri tanımlayın:

**Not:** Gizli bilgileriniz için `.env.local` dosyası oluşturmanız önerilir (Git'e commit edilmez).

```env
# OpenAI Yapılandırması
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ASSISTANT_ID=your_assistant_id_here
OPENAI_VECTOR_STORE_ID=your_vector_store_id_here

# Veritabanı (Opsiyonel - Chat kayıtları için)
DB_SERVER=your_database_server
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# Uygulama Ayarları
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 🔑 API Key Alma

1. **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/api-keys) adresinden alabilirsiniz
2. **Assistant ID**: OpenAI Playground'da asistan oluşturduktan sonra ID'yi kopyalayın
3. **Vector Store ID**: OpenAI dosya yükleme bölümünden vector store ID'sini alın

**Kurulum sonrası:** Bu bilgileri `.env` dosyasındaki ilgili alanlara yapıştırın.

### 🗄️ Veritabanı Kurulumu (Opsiyonel)

Chat geçmişi ve kullanıcı feedback'lerini kaydetmek için SQL Server veritabanı kullanabilirsiniz:

1. **SQL Server'ı hazırlayın** (LocalDB, Express veya tam sürüm)

2. **Veritabanını oluşturun:**

   ```bash
   # SQL Server Management Studio ile database-setup.sql dosyasını çalıştırın
   # Veya komut satırından:
   sqlcmd -S localhost -i database-setup.sql
   ```

---

## 📁 Proje Yapısı

```
Chatbot-First-Version/
└── dipos chatbot/                   # Ana proje klasörü
    ├── 📁 app/                      # Next.js App Router
    │   ├── 🔧 globals.css          # Global stiller
    │   ├── 📄 layout.tsx           # Ana layout
    │   ├── 🏠 page.tsx             # Ana sayfa
    │   └── 📁 api/                 # API rotaları
    │       ├── 💬 chat/            # Chat API endpoint
    │       └── 👤 session/         # Session yönetimi
    ├── 📁 components/               # React bileşenleri
    │   ├── 🎨 theme-provider.tsx   # Tema sağlayıcısı
    │   ├── 🌓 theme-toggle-button.tsx # Tema değiştirici
    │   ├── 📁 chat/                # Chat bileşenleri
    │   │   ├── 🤖 chatbot.tsx      # Ana chatbot bileşeni
    │   │   ├── 💬 chat-message.tsx # Mesaj bileşeni
    │   │   ├── 📝 chat-input.tsx   # Mesaj girişi
    │   │   ├── 📋 chat-message-list.tsx # Mesaj listesi
    │   │   ├── 🎭 mascot-avatar.tsx # Avatar bileşeni
    │   │   ├── ⭐ message-rating.tsx # Mesaj değerlendirme
    │   │   └── 🎯 quick-rating.tsx # Hızlı değerlendirme
    │   └── 📁 ui/                  # UI bileşenleri (Shadcn/ui)
    ├── 📁 hooks/                   # React hooks
    │   ├── 📱 use-mobile.ts        # Mobil algılama
    │   └── 🔔 use-toast.ts         # Toast bildirimleri
    ├── 📁 lib/                     # Yardımcı kütüphaneler
    │   ├── 🤖 openai-service.ts    # OpenAI servis katmanı
    │   ├── 📊 types.ts             # TypeScript tipleri
    │   └── 🛠️ utils.ts             # Yardımcı fonksiyonlar
    ├── 📁 public/                  # Statik dosyalar
    │   ├── 🎭 co-pilot.gif         # Maskot animasyonu
    │   ├── 🖼️ favicon.png          # Site ikonu
    │   └── 📷 placeholder-*.jpg    # Placeholder görselleri
    ├── 📁 scripts/                 # Veri işleme scriptleri
    │   ├── 🔍 api-scraper.js       # API veri toplama
    │   ├── 📊 generate-sample-knowledge.js # Örnek veri üretimi
    │   └── 🌐 scrape-zetacad-akademi.js # ZetaCAD veri toplama
    ├── 📁 styles/                  # CSS dosyaları
    └── 📄 package.json             # Proje bağımlılıkları
```

---

## 🚀 Deployment

### Vercel (Önerilen)

1. **Vercel hesabınıza bağlayın**

   ```bash
   npx vercel
   ```

2. **Ortam değişkenlerini ayarlayın**

   - Vercel dashboard'unda Environment Variables bölümüne gidin
   - `.env.local` dosyasındaki değerleri ekleyin

3. **Deploy edin**
   ```bash
   npx vercel --prod
   ```

### Docker ile Deployment

```dockerfile
# Dockerfile örneği
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📖 API Dokümantasyonu

### Chat Endpoint

**POST** `/api/chat`

````typescript
### Chat Endpoint

**POST** `/api/chat`

```typescript
// Request
{
  "message": "ZetaCAD'de nasıl çizgi çizebilirim?",
  "threadId": "thread_abc123" // opsiyonel - OpenAI'dan gelir
}

// Response
{
  "message": "ZetaCAD'de çizgi çizmek için...",
  "threadId": "thread_abc123"
}

// Error Response
{
  "error": "Message is required and must be a string"
}
````

```

```

### Session Endpoint

**POST** `/api/session`

```typescript
// Create Session
{
  "action": "create_session",
  "userId": "user123" // opsiyonel
}

// Get Session
{
  "action": "get_session",
  "sessionId": "guest_1696334400000_abc12345"
}

// Response
{
  "sessionId": "guest_1696334400000_abc12345"
}
// veya
{
  "id": "guest_1696334400000_abc12345",
  "userId": "guest",
  "createdAt": "2025-10-03T10:30:00.000Z",
  "lastActivity": "2025-10-03T10:35:00.000Z"
}
```

### Feedback Endpoint

**POST** `/api/feedback`

```typescript
// Update Feedback
{
  "sessionId": "thread_abc123",
  "feedback": 1 // 0=pending, 1=helpful, 2=not_helpful, 3=very_helpful, 4=poor, 5=excellent
}

// Response
{
  "success": true,
  "message": "Feedback updated successfully"
}
```

**GET** `/api/feedback?sessionId=thread_abc123`

```typescript
// Response - Session History
{
  "sessionConversation": "{\"Messages\":[...]}",
  "sessionDate": "2025-10-03T10:30:00.000Z",
  "userFeedBack": 1,
  "sessionId": "thread_abc123"
}
```

### Database Test Endpoint

**GET** `/api/database`

```typescript
// Response
{
  "success": true,
  "message": "Database connection successful",
  "details": {
    "server": "localhost",
    "database": "ZetaCADChatDB",
    "connected": true
  }
}
```

---

## 🧪 Test Etme

```bash
# Projeyi manuel olarak test edin
npm run dev

# Linting kontrolü
npm run lint

# Production build testi
npm run build
```

**Not:** Henüz otomatik test framework'u eklenmemiş. şu an manuel test yaparak geliştirme yapılmaktadır.

**Not:** Henüz otomatik testler eklenmemiş. Manuel test önerilir.

---

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm run start

# Linting
npm run lint

# Bağımlılık güncellemesi
npm update
```

**Mevcut NPM Script'leri:**

- `dev` - Geliştirme sunucusu başlatır
- `build` - Production build yapar
- `start` - Production sunucusu çalıştırır
- `lint` - ESLint kontrolü yapar

---

## 🛡️ Güvenlik

- 🔐 API key'ler environment variable olarak saklanır
- 🛡️ Rate limiting uygulanmıştır
- 🔒 CORS koruması aktiftir
- 📝 Input validation yapılır
- 🎯 XSS koruması mevcuttur

---

## 🚀 Performans Optimizasyonları

- ⚡ Next.js Image optimization
- 📦 Bundle size optimization
- 🗂️ Code splitting
- 💾 Caching strategies
- 🌊 Streaming responses

---

## 🤝 Katkıda Bulunma

1. **Fork edin** 🍴
2. **Feature branch oluşturun** (`git checkout -b feature/amazing-feature`)
3. **Değişikliklerinizi commit edin** (`git commit -m 'Add some amazing feature'`)
4. **Branch'inizi push edin** (`git push origin feature/amazing-feature`)
5. **Pull Request açın** 🎯

### Kod Standartları

- TypeScript kullanın
- ESLint kurallarına uyun
- Commit mesajlarını anlamlı yazın
- Test ekleyin

---

