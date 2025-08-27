export type ChatRole = "user" | "bot"

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  rating?: number // 1-5 rating for bot messages
  images?: string[] // Array of image URLs
}