import { executeQuery } from './database';
import { ChatLogEntry, ChatSessionData, ChatSessionMessage } from './types';

export class ChatLogger {
  // Feedback değerleri
  static readonly FEEDBACK_VALUES = {
    PENDING: 0,
    HELPFUL: 1,
    NOT_HELPFUL: 2,
    VERY_HELPFUL: 3,
    POOR: 4,
    EXCELLENT: 5
  } as const;

  // Feedback etiketleri (gösterim için)
  static readonly FEEDBACK_LABELS = {
    0: 'pending',
    1: 'helpful',
    2: 'not_helpful',
    3: 'very_helpful',
    4: 'poor',
    5: 'excellent'
  } as const;

  /**
   * Tek bir chat değişimini veritabanına kaydet
   */
  static async logChatExchange(
    userMessage: string,
    assistantResponse: string,
    sessionId: string,
    sessionDate?: Date
  ): Promise<void> {
    try {
      const timestamp = (sessionDate || new Date()).toISOString();
      
      // Mevcut session'ı bul veya yeni oluştur
      let sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData) {
        sessionData = { Messages: [] };
      }

      // Yeni mesajı ekle
      const newMessage: ChatSessionMessage = {
        Request: userMessage,
        Response: assistantResponse,
        timestamp: timestamp
      };

      sessionData.Messages.push(newMessage);

      // Veritabanını güncelle
      await this.updateSessionConversation(sessionId, sessionData, timestamp);

      console.log(`Chat exchange logged for session: ${sessionId}`);
    } catch (error) {
      console.error('Error logging chat exchange:', error);
      throw error;
    }
  }

  /**
   * Session verilerini getir
   */
  static async getSessionData(sessionId: string): Promise<ChatSessionData | null> {
    try {
      const query = `
        SELECT TOP 1 sessionConversation 
        FROM ChatBotLog 
        WHERE sessionId = @sessionId 
        ORDER BY sessionDate DESC
      `;
      
      const result = await executeQuery<{ sessionConversation: string }>(query, { sessionId });
      
      if (result.recordset.length > 0) {
        const conversationJson = result.recordset[0].sessionConversation;
        return JSON.parse(conversationJson) as ChatSessionData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  /**
   * Session konuşmasını güncelle
   */
  static async updateSessionConversation(
    sessionId: string,
    sessionData: ChatSessionData,
    sessionDate: string
  ): Promise<void> {
    try {
      const conversationJson = JSON.stringify(sessionData);
      
      // Conversation rating'i al (hesaplanmış olmalı)
      const conversationRating = sessionData.conversationRating?.score || 0;
      
      // Önce mevcut kaydı kontrol et
      const existingQuery = `
        SELECT id FROM ChatBotLog WHERE sessionId = @sessionId
      `;
      
      const existingResult = await executeQuery<{ id: number }>(existingQuery, { sessionId });
      
      if (existingResult.recordset.length > 0) {
        // Mevcut kaydı güncelle
        const updateQuery = `
          UPDATE ChatBotLog 
          SET sessionConversation = @conversationJson, 
              sessionDate = @sessionDate,
              userFeedBack = @userFeedBack
          WHERE sessionId = @sessionId
        `;
        
        await executeQuery(updateQuery, {
          conversationJson,
          sessionDate,
          userFeedBack: conversationRating,
          sessionId
        });
      } else {
        // Yeni kayıt oluştur
        const insertQuery = `
          INSERT INTO ChatBotLog (sessionConversation, sessionDate, userFeedBack, sessionId)
          VALUES (@conversationJson, @sessionDate, @userFeedBack, @sessionId)
        `;
        
        await executeQuery(insertQuery, {
          conversationJson,
          sessionDate,
          userFeedBack: conversationRating,
          sessionId
        });
      }
    } catch (error) {
      console.error('Error updating session conversation:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı feedback'ini güncelle
   */
  static async updateUserFeedback(
    sessionId: string,
    feedback: number
  ): Promise<void> {
    try {
      const query = `
        UPDATE ChatBotLog 
        SET userFeedBack = @feedback
        WHERE sessionId = @sessionId
      `;
      
      await executeQuery(query, { feedback, sessionId });
      
      console.log(`Feedback updated for session ${sessionId}: ${this.FEEDBACK_LABELS[feedback as keyof typeof this.FEEDBACK_LABELS]}`);
    } catch (error) {
      console.error('Error updating user feedback:', error);
      throw error;
    }
  }

  /**
   * Mesaj rating'i güncelle (batch system - sadece rating verilince kaydet)
   */
  static async updateMessageRating(
    sessionId: string,
    messageIndex: number,
    rating: number,
    conversationHistory?: Array<{ userMessage: string; assistantResponse: string; timestamp?: string }>
  ): Promise<{ conversationRating: number; messageRating: number }> {
    try {
      // Rating kontrolü (1-5 arası)
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Mevcut session'ı kontrol et
      let sessionData = await this.getSessionData(sessionId);
      
      if (!sessionData && conversationHistory) {
        // İlk rating - conversation history'den session oluştur
        console.log(`First rating for session ${sessionId}, creating session from conversation history`);
        
        const messages: ChatSessionMessage[] = conversationHistory.map((msg, index) => ({
          Request: msg.userMessage,
          Response: msg.assistantResponse,
          messageRating: index === messageIndex ? rating : null,
          ratedAt: index === messageIndex ? new Date().toISOString() : undefined
        }));

        sessionData = { Messages: messages };
        
      } else if (sessionData && conversationHistory) {
        // Session var - yeni mesajları append et
        const currentCount = sessionData.Messages.length;
        const newCount = conversationHistory.length;
        
        if (newCount > currentCount) {
          console.log(`Appending ${newCount - currentCount} new messages to session ${sessionId}`);
          
          // Yeni mesajları ekle
          for (let i = currentCount; i < newCount; i++) {
            const msg = conversationHistory[i];
            sessionData.Messages.push({
              Request: msg.userMessage,
              Response: msg.assistantResponse,
              messageRating: i === messageIndex ? rating : null,
              ratedAt: i === messageIndex ? new Date().toISOString() : undefined
            });
          }
        }
        
        // Eğer rating mevcut bir mesaja veriliyorsa güncelle
        if (messageIndex < sessionData.Messages.length && messageIndex >= 0) {
          sessionData.Messages[messageIndex].messageRating = rating;
          sessionData.Messages[messageIndex].ratedAt = new Date().toISOString();
        }
        
      } else if (sessionData) {
        // Sadece rating güncelleme (conversation history yok)
        if (messageIndex >= 0 && messageIndex < sessionData.Messages.length) {
          sessionData.Messages[messageIndex].messageRating = rating;
          sessionData.Messages[messageIndex].ratedAt = new Date().toISOString();
        } else {
          throw new Error(`Message index ${messageIndex} out of range`);
        }
      } else {
        throw new Error('Session not found and no conversation history provided');
      }

      // Conversation rating'i hesapla (sadece rated mesajlardan)
      const conversationRating = this.calculateConversationRating(sessionData.Messages);
      
      // Conversation rating bilgisini güncelle
      sessionData.conversationRating = {
        score: conversationRating,
        ratedMessageCount: sessionData.Messages.filter(m => m.messageRating !== null && m.messageRating !== undefined).length,
        totalMessageCount: sessionData.Messages.length
      };

      // Veritabanını güncelle
      await this.updateSessionConversation(sessionId, sessionData, new Date().toISOString());

      console.log(`Message rating updated for session ${sessionId}, message ${messageIndex}: ${rating}`);
      console.log(`Conversation rating calculated: ${conversationRating} (from ${sessionData.conversationRating?.ratedMessageCount || 0} rated messages)`);

      return {
        conversationRating,
        messageRating: rating
      };
    } catch (error) {
      console.error('Error updating message rating:', error);
      throw error;
    }
  }

  /**
   * Conversation rating hesapla (sadece rating verilen mesajlardan)
   */
  static calculateConversationRating(messages: ChatSessionMessage[]): number {
    const ratedMessages = messages.filter(m => m.messageRating !== null && m.messageRating !== undefined && m.messageRating >= 1);
    
    if (ratedMessages.length === 0) return 0;
    if (ratedMessages.length === 1) return ratedMessages[0].messageRating!;
    
    // 2-3 mesaj: basit ağırlıklı ortalama
    if (ratedMessages.length <= 3) {
      let totalScore = 0;
      let totalWeight = 0;
      
      ratedMessages.forEach((message, index) => {
        const weight = Math.pow(1.2, index); // Sonraki mesajlar daha ağırlıklı
        totalScore += message.messageRating! * weight;
        totalWeight += weight;
      });
      
      return Math.round(totalScore / totalWeight);
    }
    
    // 4+ mesaj: son 3'ün ağırlığı %70, diğerleri %30
    const recent = ratedMessages.slice(-3);
    const earlier = ratedMessages.slice(0, -3);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.messageRating!, 0) / recent.length;
    const earlierAvg = earlier.length > 0 
      ? earlier.reduce((sum, m) => sum + m.messageRating!, 0) / earlier.length
      : recentAvg;
    
    return Math.round((recentAvg * 0.7) + (earlierAvg * 0.3));
  }

  /**
   * Session'a ait tüm konuşmaları getir
   */
  static async getSessionHistory(sessionId: string): Promise<ChatLogEntry | null> {
    try {
      const query = `
        SELECT sessionConversation, sessionDate, userFeedBack, sessionId
        FROM ChatBotLog
        WHERE sessionId = @sessionId
      `;
      
      const result = await executeQuery<ChatLogEntry>(query, { sessionId });
      
      if (result.recordset.length > 0) {
        return result.recordset[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session history:', error);
      return null;
    }
  }

  /**
   * Tüm session'ları getir (sayfalama ile)
   */
  static async getAllSessions(
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ sessions: ChatLogEntry[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Toplam sayı
      const countQuery = `SELECT COUNT(*) as total FROM ChatBotLog`;
      const countResult = await executeQuery<{ total: number }>(countQuery);
      const total = countResult.recordset[0].total;
      
      // Sayfalanmış veriler
      const dataQuery = `
        SELECT sessionConversation, sessionDate, userFeedBack, sessionId
        FROM ChatBotLog
        ORDER BY sessionDate DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `;
      
      const dataResult = await executeQuery<ChatLogEntry>(dataQuery, { offset, pageSize });
      
      return {
        sessions: dataResult.recordset,
        total
      };
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return { sessions: [], total: 0 };
    }
  }

  /**
   * Feedback istatistiklerini getir
   */
  static async getFeedbackStats(): Promise<Record<string, number>> {
    try {
      const query = `
        SELECT userFeedBack, COUNT(*) as count
        FROM ChatBotLog
        GROUP BY userFeedBack
      `;
      
      const result = await executeQuery<{ userFeedBack: number; count: number }>(query);
      
      const stats: Record<string, number> = {};
      result.recordset.forEach(row => {
        const label = this.FEEDBACK_LABELS[row.userFeedBack as keyof typeof this.FEEDBACK_LABELS];
        stats[label] = row.count;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return {};
    }
  }

  /**
   * Belirli tarih aralığındaki session'ları getir
   */
  static async getSessionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ChatLogEntry[]> {
    try {
      const query = `
        SELECT sessionConversation, sessionDate, userFeedBack, sessionId
        FROM ChatBotLog
        WHERE sessionDate BETWEEN @startDate AND @endDate
        ORDER BY sessionDate DESC
      `;
      
      const result = await executeQuery<ChatLogEntry>(query, { startDate, endDate });
      return result.recordset;
    } catch (error) {
      console.error('Error getting sessions by date range:', error);
      return [];
    }
  }
}