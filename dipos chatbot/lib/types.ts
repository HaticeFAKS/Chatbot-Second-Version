export type ChatRole = "user" | "bot"

export interface ChatMessage {
  message: string;
  threadId?: string;
}

// Database types
export interface DatabaseConfig {
  user: string;
  password: string;
  server: string;
  port: number;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

export interface QueryResult<T = Record<string, unknown>> {
  recordset: T[];
  recordsets: T[][];
  rowsAffected: number[];
}

export interface DatabaseError extends Error {
  code?: string;
  number?: number;
}

export type QueryParameters = Record<string, unknown>;

// Chat logging types
export interface ChatLogEntry {
  id?: number;
  sessionConversation: string; // JSON string
  sessionDate: string; // ISO string format
  userFeedBack: number; // tinyint value (0-255)
  sessionId: string; // OpenAI thread ID
}

export interface ChatUserSession {
  Id?: number;
  SelectedPfirmId?: number;
  PfirmDfirmId?: number;
  UserId?: number;
}

export interface ChatSessionMessage {
  Request: string;
  Response: string;
  messageRating?: number | null;  // Mesaj rating'i
  ratedAt?: string;               // Rating verilme zamanı
}

export interface ConversationRating {
  score: number;                  // Hesaplanan conversation rating (1-5)
  ratedMessageCount: number;      // Rating verilen mesaj sayısı
  totalMessageCount: number;      // Toplam mesaj sayısı
}

export interface ChatSessionData {
  Messages: ChatSessionMessage[];
  conversationRating?: ConversationRating;  // Yeni: conversation rating bilgisi
}