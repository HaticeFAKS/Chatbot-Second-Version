import OpenAI from "openai";
import { extractRelevantImages, searchKnowledgeByKeywords, getExactContent } from "./knowledge-service";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID!;

export async function getOpenAIResponse(userMessage: string): Promise<{ content: string; images?: string[] }> {
  try {
    console.log('[OpenAI Service] Processing message:', userMessage)
    
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[OpenAI Service] No OpenAI API key found')
      return {
        content: "OpenAI servisine bağlanılamıyor, lütfen daha sonra tekrar deneyin."
      }
    }

    if (!VECTOR_STORE_ID) {
      console.warn('[OpenAI Service] No vector store ID found')
      return {
        content: "Bilgi tabanı yapılandırılmamış."
      }
    }

    // ONLY Vector Store Content - No ChatGPT general knowledge
    console.log('[OpenAI] Searching ONLY in vector store for:', userMessage);
    console.log('[OpenAI] Vector Store ID:', VECTOR_STORE_ID);
    
    let textContent = "";
    let vectorStoreContext = "";
    
    try {
      // HYBRID APPROACH: 
      // 1. First try exact local search for immediate matches
      // 2. If no local match, use vector store to check relevance
      console.log('[OpenAI] Step 1: Trying exact local search first...');
      
      const exactContent = getExactContent(userMessage);
      
      if (exactContent && exactContent.content.length > 50) {
        console.log('[OpenAI] Found exact local match, skipping vector store search');
        textContent = exactContent.content;
        
        // Add any images from the matched item
        const itemImages = exactContent.images || [];
        if (itemImages.length > 0) {
          console.log('[OpenAI] Found', itemImages.length, 'images in matched content');
        }
      } else {
        // Step 2: If no local match, check vector store for relevance
        console.log('[OpenAI] No local match found, checking vector store for relevance...');
        
        const assistant = await client.beta.assistants.create({
          name: "ZetaCAD Relevance Check",
          instructions: `Sen sadece şu soruyu cevapla: Verilen dosyalarda bu konuyla ilgili bilgi var mı? 
Sadece "EVET" ya da "HAYIR" cevabı ver. Başka hiçbir şey yazma.`,
          model: "gpt-4o",
          tools: [{ type: "file_search" }],
          tool_resources: {
            file_search: {
              vector_store_ids: [VECTOR_STORE_ID]
            }
          }
        });
        
        const thread = await client.beta.threads.create();
        
        await client.beta.threads.messages.create(thread.id, {
          role: "user",
          content: `Bu konuda bilgi var mı: ${userMessage}`
        });
        
        const run = await client.beta.threads.runs.createAndPoll(
          thread.id,
          { 
            assistant_id: assistant.id,
            max_completion_tokens: 50
          },
          { pollIntervalMs: 1000 }
        );
        
        let isRelevant = false;
        if (run.status === 'completed') {
          const messages = await client.beta.threads.messages.list(thread.id);
          const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
          
          if (assistantMessage && assistantMessage.content[0] && assistantMessage.content[0].type === 'text') {
            const response = assistantMessage.content[0].text.value.trim().toUpperCase();
            isRelevant = response.includes('EVET') || response.includes('YES');
            console.log('[OpenAI] Vector store relevance check:', response, '-> Relevant:', isRelevant);
          }
        }
        
        // Cleanup assistant
        await client.beta.assistants.delete(assistant.id);
        
        if (isRelevant) {
          // Try local search again with more lenient criteria
          console.log('[OpenAI] Vector store found relevance, trying broader local search...');
          const broadContent = getExactContent(userMessage);
          
          if (broadContent) {
            console.log('[OpenAI] Found content with broader search');
            textContent = broadContent.content;
          } else {
            textContent = "İlgili içerik vector store'da bulundu ancak tam eşleşme yapılamıyor. Lütfen sorunuzu daha spesifik hale getirin.";
          }
        } else {
          console.log('[OpenAI] Vector store indicates no relevant content');
          textContent = "";
        }
      }
      
    } catch (error) {
      console.error('[OpenAI] Vector store search error:', error);
      return { content: "Vector store aramasında hata oluştu. Lütfen tekrar deneyin." };
    }
    
    // If no content found in vector store
    if (!textContent || textContent.trim().length === 0) {
      console.log('[OpenAI] No relevant content found in vector store');
      textContent = "Bu konuda yüklenen dosyalarda bilgi bulunamadı. Lütfen başka bir soru deneyin.";
    }

    // Extract images from HTML content and knowledge base
    const imageUrlRegex = /https:\/\/raw\.githubusercontent\.com\/[^\s"'<>)]+\.(png|jpg|jpeg|gif|webp)/gi;
    const foundImages = textContent.match(imageUrlRegex) || [];
    
    // For HTML content, also extract img src attributes
    const imgSrcRegex = /<img[^>]+src="([^"]+)"/gi;
    let imgMatch;
    const htmlImages: string[] = [];
    while ((imgMatch = imgSrcRegex.exec(textContent)) !== null) {
      htmlImages.push(imgMatch[1]);
    }
    
    // Get additional relevant images from knowledge base
    console.log('[OpenAI Service] Looking for additional images for query:', userMessage)
    console.log('[OpenAI Service] HTML content contains', htmlImages.length, 'embedded images')
    
    const relevantImages = extractRelevantImages(textContent, userMessage);
    console.log('[OpenAI Service] Found', relevantImages.length, 'additional relevant images')
    
    // Combine all images
    const allImages = [...foundImages, ...htmlImages, ...relevantImages];
    
    // Remove duplicates and limit (max 6 images for HTML content)
    const uniqueImages = [...new Set(allImages)].slice(0, 6);

    // For HTML content, don't strip markdown - preserve exact HTML structure
    if (textContent.includes('<') && textContent.includes('>')) {
      console.log('[OpenAI Service] Preserving HTML structure for direct rendering');
      // Keep HTML as-is for direct injection into chat
    } else {
      // Only clean markdown for non-HTML content
      textContent = textContent
        .replace(/\*\*(.*?)\*\*/g, '$1') // **bold** -> bold
        .replace(/\*(.*?)\*/g, '$1')     // *italic* -> italic
        .replace(/#{1,6}\s/g, '')        // # headers -> normal text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](link) -> text
        .trim();
    }

    // Eğer metin boşsa ama resimler varsa, fallback mesajı ver
    if (!textContent && uniqueImages.length > 0) {
      textContent = "Bu konuyla ilgili dosyalarımda sadece görseller var. Lütfen aşağıdaki resimleri inceleyin.";
    } else if (!textContent) {
      textContent = "Bu konuda dosyalarımda bilgi bulunamadı. Lütfen başka bir soru sormayı deneyin.";
    }

    console.log('[OpenAI Service] Final response - Text length:', textContent.length, 'Images:', uniqueImages.length);
    console.log('[OpenAI Service] IMPORTANT: Using HYBRID approach - Vector store relevance + Exact HTML content from JSON');
    console.log('[OpenAI Service] Content type:', textContent.includes('<') ? 'HTML (preserved)' : 'Plain text');

    return {
      content: textContent,
      images: uniqueImages.length > 0 ? uniqueImages : undefined
    };
  } catch (err) {
    console.error("[OpenAI Service] error:", err);
    return { content: "Bir hata oluştu." };
  }
}
