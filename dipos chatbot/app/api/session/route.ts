import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Simple session interface for basic functionality
interface SimpleSession {
  id: string
  userId: string
  createdAt: Date
  lastActivity: Date
}

// In-memory session storage (for development - replace with database later)
const sessions = new Map<string, SimpleSession>()

export async function POST(request: NextRequest) {
  try {
    const { action, userId, sessionId: incomingSessionId } = await request.json()
    let sessionId: string

    switch (action) {
      case "create_session":
        sessionId = `${userId || "guest"}_${Date.now()}_${uuidv4().slice(0, 8)}`
        const newSession: SimpleSession = {
          id: sessionId,
          userId: userId || "guest",
          createdAt: new Date(),
          lastActivity: new Date()
        }
        sessions.set(sessionId, newSession)
        return NextResponse.json({ sessionId })

      case "get_session":
        if (!incomingSessionId) {
          return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
        }

        const session = sessions.get(incomingSessionId)
        if (!session) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
        
        // Update last activity
        session.lastActivity = new Date()
        sessions.set(incomingSessionId, session)
        
        return NextResponse.json(session)

      case "update_user_session":
        if (!incomingSessionId) {
          return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
        }

        const existingSession = sessions.get(incomingSessionId)
        if (!existingSession) {
          return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
        
        // Update last activity
        existingSession.lastActivity = new Date()
        sessions.set(incomingSessionId, existingSession)
        
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}