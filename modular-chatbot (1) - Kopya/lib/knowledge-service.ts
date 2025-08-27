import fs from 'fs'
import path from 'path'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  transcript: string
  images: string[]
  keywords?: string[]
}

// Knowledge base data cache
let knowledgeBase: KnowledgeItem[] | null = null

// Load knowledge base from JSON file
function loadKnowledgeBase(): KnowledgeItem[] {
  if (knowledgeBase) return knowledgeBase

  try {
    // Check for optimized JSON file first
    const optimizedPath = path.join(process.cwd(), 'zetacad_openai_optimized.json')
    
    // Fallback paths if the optimized file doesn't exist
    const fallbackPaths = [
      path.join(process.cwd(), '..', 'Veri Hazırlama', 'kb_dataset_w_images.json'),
      path.join(process.cwd(), 'kb_dataset_w_images.json'),
      path.join(process.cwd(), 'data', 'kb_dataset_w_images.json'),
      'c:\\Users\\riytt\\Desktop\\Üniversite\\staj\\Veri Hazırlama\\kb_dataset_w_images.json'
    ]

    let dataPath = optimizedPath
    
    // Try optimized file first, then fallbacks
    if (!fs.existsSync(optimizedPath)) {
      console.log('[Knowledge Service] Optimized file not found, trying fallbacks...')
      const validPath = fallbackPaths.find(p => fs.existsSync(p))
      if (validPath) {
        dataPath = validPath
      } else {
        console.warn('[Knowledge Service] Knowledge base file not found')
        return []
      }
    } else {
      console.log('[Knowledge Service] Using optimized JSON file')
    }

    const data = fs.readFileSync(dataPath, 'utf-8')
    knowledgeBase = JSON.parse(data) as KnowledgeItem[]
    console.log(`[Knowledge Service] Loaded ${knowledgeBase.length} knowledge items from ${dataPath}`)
    return knowledgeBase
  } catch (error) {
    console.error('[Knowledge Service] Error loading knowledge base:', error)
    return []
  }
}

// Extract relevant images based on content keywords - ONLY from the best matching item
export function extractRelevantImages(responseText: string, userQuery: string): string[] {
  const kb = loadKnowledgeBase()
  if (kb.length === 0) return []

  // Türkçe karakterleri normalize et ve kelimeleri ayıkla
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
  }
  
  const queryWords = normalizeText(userQuery)
  const responseWords = normalizeText(responseText)
  
  // Anahtar kelimeleri birleştir
  const allKeywords = [...new Set([...queryWords, ...responseWords])]
  
  let bestMatch: { item: KnowledgeItem; score: number } | null = null
  
  for (const item of kb) {
    if (item.images && item.images.length > 0) {
      const itemText = normalizeText(`${item.title} ${item.content} ${item.transcript}`)
      
      // Çok daha sert eşleşme - en az 3 tam kelime eşleşmesi gerekli
      const exactMatches = allKeywords.filter(keyword => 
        itemText.some(word => word === keyword)
      ).length
      
      // Sadece 3+ tam eşleşme varsa dikkate al
      if (exactMatches >= 3) {
        if (!bestMatch || exactMatches > bestMatch.score) {
          bestMatch = { item, score: exactMatches }
        }
      }
    }
  }

  // Sadece en iyi eşleşmenin resimlerini döndür
  if (bestMatch) {
    console.log(`[Knowledge Service] Best match: ${bestMatch.item.title} (${bestMatch.score} exact matches, ${bestMatch.item.images.length} images)`)
    return bestMatch.item.images
  }
  
  console.log(`[Knowledge Service] No suitable match found for query: ${userQuery}`)
  return []
}

// Search for specific content by keywords
export function searchKnowledgeByKeywords(keywords: string[]): KnowledgeItem[] {
  const kb = loadKnowledgeBase()
  if (kb.length === 0) return []

  return kb.filter(item => {
    const itemText = `${item.title} ${item.content} ${item.transcript}`.toLowerCase()
    return keywords.some(keyword => itemText.includes(keyword.toLowerCase()))
  })
}

// Get exact HTML content for direct rendering based on user query
export function getExactContent(userQuery: string): { content: string; images: string[] } | null {
  const kb = loadKnowledgeBase()
  if (kb.length === 0) return null

  // Normalize text for better matching
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/'/g, '').replace(/'/g, '').replace(/'/g, '') // Remove apostrophes
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1) // Changed from 2 to 1 for better matching
  }
  
  const queryWords = normalizeText(userQuery)
  console.log('[Knowledge Service] Query words:', queryWords)
  
  let bestMatch: { item: KnowledgeItem; score: number; matchType: string } | null = null
  
  for (const item of kb) {
    const itemTitle = normalizeText(item.title)
    const itemContent = normalizeText(item.content)
    const itemKeywords = item.keywords ? item.keywords.map(k => k.toLowerCase()) : []
    
    console.log(`[Knowledge Service] Checking item: ${item.title}`);
    console.log(`[Knowledge Service] Item title words:`, itemTitle);
    
    // Check for exact title match (highest priority)
    const titleMatchCount = queryWords.filter(queryWord => 
      itemTitle.some(titleWord => 
        titleWord === queryWord || 
        titleWord.includes(queryWord) || 
        queryWord.includes(titleWord)
      )
    ).length
    
    // Check for content matches
    const contentMatchCount = queryWords.filter(queryWord => 
      itemContent.some(contentWord => contentWord === queryWord)
    ).length
    
    // Check for keyword matches
    const keywordMatchCount = queryWords.filter(queryWord => 
      itemKeywords.some(keyword => 
        keyword === queryWord || 
        keyword.includes(queryWord) || 
        queryWord.includes(keyword)
      )
    ).length
    
    // Calculate total score with weights
    const titleScore = titleMatchCount * 10; // Title matches are worth 10x
    const contentScore = contentMatchCount * 2; // Content matches worth 2x
    const keywordScore = keywordMatchCount * 1; // Keyword matches worth 1x
    const totalScore = titleScore + contentScore + keywordScore
    
    console.log(`[Knowledge Service] ${item.title} - Title:${titleMatchCount} Content:${contentMatchCount} Keywords:${keywordMatchCount} Total:${totalScore}`);
    
    // Special handling for the specific "daire no 0" query
    if (item.id === "daire-nosu-0-olan-izimler" && 
        (userQuery.includes('daire') && (userQuery.includes('0') || userQuery.includes('no')))) {
      console.log('[Knowledge Service] Found exact match for daire no 0 query!');
      return {
        content: item.content,
        images: item.images || []
      }
    }
    
    if (totalScore > 0) {
      const matchType = titleScore > 0 ? 'title' : contentScore > 0 ? 'content' : 'keyword'
      if (!bestMatch || totalScore > bestMatch.score) {
        bestMatch = { item, score: totalScore, matchType }
      }
    }
  }

  if (bestMatch && bestMatch.score >= 5) { // Lowered threshold for better matching
    console.log(`[Knowledge Service] Found exact content match: ${bestMatch.item.title} (score: ${bestMatch.score}, type: ${bestMatch.matchType})`)
    return {
      content: bestMatch.item.content,
      images: bestMatch.item.images || []
    }
  }
  
  console.log(`[Knowledge Service] No exact content match found for: ${userQuery}`)
  return null
}