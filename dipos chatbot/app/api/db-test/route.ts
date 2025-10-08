import { NextRequest, NextResponse } from "next/server";
import { testDatabaseConnection, checkTablesExist } from "@/lib/database";
import { ChatLogger } from "@/lib/chat-logger";

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // 1. Bağlantı testi
    const connectionSuccess = await testDatabaseConnection();
    
    if (!connectionSuccess) {
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        connection: false,
        tables: null,
        stats: null
      }, { status: 500 });
    }

    // 2. Tablo kontrolü
    const tablesExist = await checkTablesExist();
    
    // 3. İstatistikler (tablolar varsa)
    let stats = null;
    if (tablesExist.chatBotLog) {
      try {
        stats = await ChatLogger.getFeedbackStats();
      } catch (error) {
        console.warn('Could not get feedback stats:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database test completed",
      connection: connectionSuccess,
      tables: tablesExist,
      stats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Database test API error:", err);
    return NextResponse.json({
      success: false,
      message: "Database test failed",
      error: err instanceof Error ? err.message : "Unknown error",
      connection: false,
      tables: null,
      stats: null
    }, { status: 500 });
  }
}