import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database-service"
import type { ChatBotUserSession } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { action, userId, sessionData, sessionId: incomingSessionId } = await request.json()
    let sessionId: string

    switch (action) {
      case "create_session":
        sessionId = await DatabaseService.initializeSession(userId || "guest")
        return NextResponse.json({ sessionId })

      case "get_session":
        const sid = incomingSessionId
        if (!sid) {
          return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
        }

        const session: ChatBotUserSession | null = await DatabaseService.getUserSession(incomingSessionId)
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
        return NextResponse.json(session)


      case "update_user_session":
        if (!sessionData || !incomingSessionId) {
          return NextResponse.json({ error: "Missing session data or sessionId" }, { status: 400 })
        }

        await DatabaseService.updateUserSession(incomingSessionId, sessionData as ChatBotUserSession)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}