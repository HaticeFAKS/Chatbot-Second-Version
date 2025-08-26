import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID!;

export async function getOpenAIResponse(userMessage: string): Promise<string> {
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: userMessage }],
        },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [VECTOR_STORE_ID],
        },
      ],
    });

    if (!response.output || response.output.length === 0) {
      return "Cevap alınamadı.";
    }

    // Tüm output item'larını dolaş ve ilk output_text bulun
    for (const item of response.output) {
      if (item.type === "message" && 'content' in item && item.content) {
        for (const block of item.content) {
          if (block.type === "output_text" && block.text) {
            return block.text;
          }
        }
      }
    }

    return "Cevap alınamadı.";
  } catch (err) {
    console.error("[OpenAI Service] error:", err);
    return "Bir hata oluştu.";
  }
}
