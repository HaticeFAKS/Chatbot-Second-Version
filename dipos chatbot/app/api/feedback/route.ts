import { NextRequest, NextResponse } from "next/server";
import { ChatLogger } from "@/lib/chat-logger";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, messageIndex, rating, conversationHistory } = await request.json();
    
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "SessionId is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof messageIndex !== "number" || messageIndex < 0) {
      return NextResponse.json(
        { error: "MessageIndex is required and must be a non-negative number" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    console.log('Processing message rating:', {
      sessionId,
      messageIndex,
      rating,
      hasConversationHistory: !!conversationHistory
    });

    // Mesaj rating'ini güncelle (ilk rating ise conversation history ile)
    const result = await ChatLogger.updateMessageRating(
      sessionId,
      messageIndex,
      rating,
      conversationHistory
    );

    return NextResponse.json({
      success: true,
      messageRating: result.messageRating,
      conversationRating: result.conversationRating,
      messageIndex: messageIndex
    });

  } catch (err) {
    console.error("Message rating API error:", err);
    return NextResponse.json({ 
      error: "Internal server error",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "SessionId parameter is required" },
        { status: 400 }
      );
    }

    const sessionHistory = await ChatLogger.getSessionHistory(sessionId);
    
    if (!sessionHistory) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(sessionHistory);
  } catch (err) {
    console.error("Get session API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}