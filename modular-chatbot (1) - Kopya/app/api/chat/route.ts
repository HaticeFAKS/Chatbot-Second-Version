import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "@/lib/types";
import { getOpenAIResponse } from "@/lib/openai-service"; // bizim yazdığımız service

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, message } = await request.json();

    if (!action) {
      return NextResponse.json({ error: "Action missing" }, { status: 400 });
    }

    switch (action) {
      case "send_message":
        if (!sessionId || !message) {
          return NextResponse.json({ error: "Missing sessionId or message" }, { status: 400 });
        }

        // OpenAI Assistant çağrısı (KB bağlı)
        const aiResponse = await getOpenAIResponse(message);

        // Bot mesajı
        const botMsg: ChatMessage = {
          id: uuidv4(),
          content: aiResponse.content,
          sender: "bot",
          timestamp: new Date(),
          images: aiResponse.images,
        };

        return NextResponse.json({ botMessage: botMsg });

      case "get_history":
        if (!sessionId) {
          return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        }
        return NextResponse.json({}); // şimdilik DB yok

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
