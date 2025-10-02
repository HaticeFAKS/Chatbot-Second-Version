export type ChatRole = "user" | "bot"

export interface ChatMessage {
  message: string;
  threadId?: string;
}