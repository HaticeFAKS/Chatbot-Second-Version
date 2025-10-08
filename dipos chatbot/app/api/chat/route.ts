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


    const botMsg: ChatMessage = {
      message: aiResponse.response,
      threadId: aiResponse.threadId,
    };

    return NextResponse.json(botMsg);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
