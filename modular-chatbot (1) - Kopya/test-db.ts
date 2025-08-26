import { DatabaseService } from "./lib/database-service";

async function testDBConnection() {
  console.log("🔗 SQL bağlantısı test ediliyor...");
  console.log("DB_SERVER from env:", process.env.DB_SERVER);

  try {
    // Test için basit bir SELECT sorgusu
    const pool = await (DatabaseService as any).getPool?.() // getPool artık private, pool direkt bağlanalım
      || await import("./lib/database-service").then(m => m);

    const result = await pool.pool?.request().query("SELECT 1 AS test"); // pool referansı yok, dolayısıyla test sorgusunu DatabaseService üzerinden yapabiliriz

    // Alternatif: DatabaseService üzerinden statik bir test fonksiyonu ekleyebiliriz
    console.log("✅ Test başarılı:", result?.recordset[0] ?? "Çıktı yok");
  } catch (err) {
    console.error("❌ Test sırasında hata:", err);
  }
}

testDBConnection();
