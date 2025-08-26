export type ChatRole = "user" | "bot"

export interface ChatBotUserSession {
  Id: string
  UserName: string
  UserType: string
  FullName: string
  Email: string
  SelectedPfirmName: string
  SelectedPfirmId: string
  PfirmDfirmId: string
  PfirmDfirmName: string
  Segment: string
  SessionId: string
  UserId: string
}

export interface ChatBotLog {
  Id: string
  sessionConversation: ChatMessage[]
  sessionDate: Date
  userFeedBack?: number // 1-5 rating
  sessionId: string
}

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  rating?: number // 1-5 rating for bot messages
}