import { NextRequest, NextResponse } from "next/server";
import { getOpenAIResponse } from "@/lib/openai-service";
import { ChatMessage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const aiResponse = await getOpenAIResponse(message, threadId);

    // Note: Chat logging is now handled after rating is provided
    // No immediate database logging to prevent saving conversations without user feedback

    const botMsg: ChatMessage = {
      message: aiResponse.response,
      threadId: aiResponse.threadId,
    };

    return NextResponse.json(botMsg);
  } catch (err) {
    console.error("Chat API error:", err);
    
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    if (err instanceof Error) {
      errorMessage = err.message;
      
      // Handle specific OpenAI errors
      if (errorMessage.includes('API key')) {
        statusCode = 401;
        errorMessage = 'Invalid OpenAI API key';
      } else if (errorMessage.includes('assistant')) {
        statusCode = 400;
        errorMessage = 'Assistant configuration error';
      } else if (errorMessage.includes('thread')) {
        statusCode = 400;
        errorMessage = 'Thread error';
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
