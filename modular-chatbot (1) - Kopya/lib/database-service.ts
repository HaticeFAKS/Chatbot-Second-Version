import sql from "mssql";
import { v4 as uuidv4 } from "uuid";
import { ChatBotUserSession, ChatBotLog, ChatMessage } from "./types";

const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD!;
const dbServer = process.env.DB_SERVER!;
const dbName = process.env.DB_NAME!;

const config: sql.config = {
  user: dbUser,
  password: dbPassword,
  server: dbServer,
  database: dbName,
  options: { trustServerCertificate: true },
};

export const DatabaseService = {
  pool: null as sql.ConnectionPool | null,

  getPool: async (): Promise<sql.ConnectionPool> => {
    if (DatabaseService.pool) return DatabaseService.pool;
    const newPool = await sql.connect(config);
    DatabaseService.pool = newPool;
    return newPool;
  },

  initializeSession: async (userId: string): Promise<string> =>
    `${userId}_${Date.now()}`,

  getUserSession: async (sessionId: string): Promise<ChatBotUserSession | null> => {
    const pool = await DatabaseService.getPool();
    const result = await pool
      .request()
      .input("SessionId", sql.NVarChar, sessionId)
      .query("SELECT * FROM ChatBotUserSession WHERE SessionId = @SessionId");
    return result.recordset[0] || null;
  },

  updateUserSession: async (sessionId: string, session: ChatBotUserSession) => {
    const pool = await DatabaseService.getPool();
    await pool
      .request()
      .input("Id", sql.NVarChar, session.Id)
      .input("FullName", sql.NVarChar, session.FullName)
      .input("UserName", sql.NVarChar, session.UserName)
      .input("Email", sql.NVarChar, session.Email)
      .input("SelectedPfirmName", sql.NVarChar, session.SelectedPfirmName)
      .input("SelectedPfirmId", sql.NVarChar, session.SelectedPfirmId)
      .input("PfirmDfirmId", sql.NVarChar, session.PfirmDfirmId)
      .input("PfirmDfirmName", sql.NVarChar, session.PfirmDfirmName)
      .input("Segment", sql.NVarChar, session.Segment)
      .input("SessionId", sql.NVarChar, session.SessionId)
      .input("UserId", sql.NVarChar, session.UserId)
      .query(
        `UPDATE ChatBotUserSession SET 
          FullName=@FullName, UserName=@UserName, Email=@Email, 
          SelectedPfirmName=@SelectedPfirmName, SelectedPfirmId=@SelectedPfirmId,
          PfirmDfirmId=@PfirmDfirmId, PfirmDfirmName=@PfirmDfirmName,
          Segment=@Segment
        WHERE SessionId=@SessionId`
      );
  },

  getChatHistory: async (sessionId: string): Promise<ChatBotLog | null> => {
    const pool = await DatabaseService.getPool();
    const result = await pool
      .request()
      .input("SessionId", sql.NVarChar, sessionId)
      .query(
        `SELECT TOP 1 * 
         FROM ChatBotLog 
         WHERE SessionId = @SessionId 
         ORDER BY sessionDate DESC`
      );

    if (!result.recordset[0]) return null;

    const row = result.recordset[0];
    return {
      Id: row.Id,
      sessionConversation: JSON.parse(row.sessionConversation || "[]"),
      sessionDate: row.sessionDate,
      sessionId: row.sessionId,
      userFeedBack: row.userFeedBack,
    };
  },

  saveChatSession: async (log: ChatBotLog) => {
    const pool = await DatabaseService.getPool();
    await pool
      .request()
      .input("Id", sql.NVarChar, log.Id)
      .input("SessionId", sql.NVarChar, log.sessionId)
      .input("SessionDate", sql.DateTime, log.sessionDate)
      .input("SessionConversation", sql.NVarChar, JSON.stringify(log.sessionConversation))
      .input("UserFeedBack", sql.Int, log.userFeedBack || null)
      .query(
        `IF EXISTS (SELECT 1 FROM ChatBotLog WHERE Id=@Id)
          UPDATE ChatBotLog 
            SET sessionConversation=@SessionConversation, 
                sessionDate=@SessionDate, 
                userFeedBack=@UserFeedBack 
          WHERE Id=@Id
         ELSE
          INSERT INTO ChatBotLog (Id, sessionConversation, sessionDate, userFeedBack, sessionId)
          VALUES (@Id, @SessionConversation, @SessionDate, @UserFeedBack, @SessionId)`
      );
  },

  addMessage: async (sessionId: string, content: string, sender: "user" | "bot"): Promise<ChatMessage> => {
    const message: ChatMessage = {
      id: uuidv4(),
      content,
      sender,
      timestamp: new Date(),
    };

    const log = await DatabaseService.getChatHistory(sessionId);
    const updatedConversation = [...(log?.sessionConversation || []), message];

    const chatLog: ChatBotLog = {
      Id: log?.Id || `${sessionId}_${Date.now()}`,
      sessionConversation: updatedConversation,
      sessionDate: new Date(),
      sessionId,
      userFeedBack: log?.userFeedBack,
    };

    await DatabaseService.saveChatSession(chatLog);
    return message;
  },
};