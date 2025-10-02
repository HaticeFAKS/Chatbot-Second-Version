import OpenAI from "openai";

export class OpenAIService {
  private openai: OpenAI;
  private assistantId: string;
  private vectorStoreId: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    if (!process.env.OPENAI_ASSISTANT_ID) {
      throw new Error('OPENAI_ASSISTANT_ID is not set');
    }
    if (!process.env.OPENAI_VECTOR_STORE_ID) {
      throw new Error('OPENAI_VECTOR_STORE_ID is not set');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.assistantId = process.env.OPENAI_ASSISTANT_ID;
    this.vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
  }

  async createThread(): Promise<string> {
    try {
      const thread = await this.openai.beta.threads.create();
      return thread.id;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw new Error('Failed to create thread');
    }
  }

  async sendMessage(message: string, threadId?: string): Promise<{ response: string; threadId: string }> {
    try {
      let currentThreadId = threadId;
      // threadId yoksa veya yanlış formatta ise yeni thread oluştur
      if (!currentThreadId || !currentThreadId.startsWith("thread_")) {
        currentThreadId = await this.createThread();
      }

      await this.openai.beta.threads.messages.create(currentThreadId, {
        role: 'user',
        content: message,
      });

      const run = await this.openai.beta.threads.runs.createAndPoll(currentThreadId, {
        assistant_id: this.assistantId,
      });

      if (run.status === 'completed') {
        const messages = await this.openai.beta.threads.messages.list(currentThreadId);
        const lastMessage = messages.data[0];

        if (lastMessage.role === 'assistant' && lastMessage.content[0]?.type === 'text') {
          return {
            response: lastMessage.content[0].text.value,
            threadId: currentThreadId
          };
        }
      } else if (run.status === 'failed') {
        console.error('Run failed:', run.last_error);
        throw new Error(`Assistant run failed: ${run.last_error?.message || 'Unknown error'}`);
      }

      throw new Error('Failed to get response from assistant');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async getThread(threadId: string) {
    try {
      return await this.openai.beta.threads.retrieve(threadId);
    } catch (error) {
      console.error('Error retrieving thread:', error);
      throw new Error('Failed to retrieve thread');
    }
  }

  async getMessages(threadId: string) {
    try {
      const messages = await this.openai.beta.threads.messages.list(threadId);
      return messages.data;
    } catch (error) {
      console.error('Error retrieving messages:', error);
      throw new Error('Failed to retrieve messages');
    }
  }
}

export const openaiService = new OpenAIService();

export async function getOpenAIResponse(message: string, threadId?: string) {
  return openaiService.sendMessage(message, threadId);
}
