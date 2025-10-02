const fs = require('fs');
const path = require('path');

// Function to clean HTML tags from text
function cleanHtmlTags(text) {
    if (!text) return '';
    
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Replace HTML entities
    cleaned = cleaned
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    
    return cleaned.trim();
}

// Function to remove greeting messages and work hour notifications
function removeGreetingsAndWorkHours(text) {
    if (!text) return '';
    
    // Patterns to remove (case insensitive)
    const patternsToRemove = [
        /\bmerhaba\b/gi,
        /\biyi çalışmalar dilerim\b/gi,
        /\biyi çalışmalar\b/gi,
        /\bmesai saatleri içinde sorabilirsiniz\b/gi,
        /\bmesai saatlerinde sorabilirsiniz\b/gi,
        /\bmesai saatleri\b/gi,
        /\bçalışma saatleri içinde\b/gi,
        /\bçalışma saatlerinde\b/gi,
        /\bsize yardımcı olabilirim\b/gi,
        /\byardımcı olabilirim\b/gi
    ];
    
    let cleanedText = text;
    patternsToRemove.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, '');
    });
    
    // Clean up extra whitespace and punctuation
    cleanedText = cleanedText.replace(/\s+/g, ' ');
    cleanedText = cleanedText.replace(/[.,;!?]+\s*$/g, '');
    
    return cleanedText.trim();
}

// Function to generate keywords from text
function generateKeywords(text) {
    if (!text) return [];
    
    // Clean the text first
    const cleanText = cleanHtmlTags(text);
    const cleanedText = removeGreetingsAndWorkHours(cleanText);
    
    // Convert to lowercase for processing
    const textLower = cleanedText.toLowerCase();
    
    // Extract words (Turkish characters included)
    const words = textLower.match(/[\wçğıöşüÇĞIİÖŞÜ]+/g) || [];
    
    // Turkish stop words and common words to filter out
    const stopWords = new Set([
        'bir', 'bu', 'da', 'de', 'den', 'için', 'ile', 've', 'var', 'olan',
        'olarak', 'gibi', 'kadar', 'sonra', 'önce', 'daha', 'çok', 'az',
        'büyük', 'küçük', 'yeni', 'eski', 'iyi', 'kötü', 'doğru', 'yanlış',
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
        'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
        'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'must', 'can', 'shall', 'that', 'this', 'these', 'those', 'then',
        'than', 'so', 'very', 'just', 'now', 'here', 'there', 'where',
        'when', 'how', 'what', 'which', 'who', 'why', 'all', 'any', 'both',
        'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
        'not', 'only', 'own', 'same', 'so', 'than', 'too', 'can', 'will',
        'just', 'don', 'should', 'now'
    ]);
    
    // Filter meaningful words (length > 2 and not stop words)
    const meaningfulWords = words.filter(word => 
        word.length > 2 && !stopWords.has(word)
    );
    
    // Count word frequency
    const wordFreq = {};
    meaningfulWords.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Sort by frequency and get top 10 keywords
    const sortedWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    
    return sortedWords;
}

// Function to parse CSV content
function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const result = [];
    
    if (lines.length < 2) return result;
    
    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing - this handles quotes but may need refinement for complex cases
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim()); // Add last value
        
        // Create object from headers and values
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            result.push(row);
        }
    }
    
    return result;
}

// Main processing function
async function processCsvToJson() {
    try {
        const csvFilePath = 'yapay-zeka-veri.csv';
        const jsonFilePath = 'zetacad_openai_optimized.json';
        
        console.log('Reading existing JSON data...');
        
        // Read existing JSON data
        const existingJsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
        const existingData = JSON.parse(existingJsonContent);
        
        console.log(`Loaded existing JSON data with ${existingData.length} entries`);
        
        // Find the highest existing ID
        let maxId = 0;
        existingData.forEach(item => {
            if (typeof item.id === 'number') {
                maxId = Math.max(maxId, item.id);
            }
        });
        
        console.log('Reading CSV data...');
        
        // Read CSV data
        const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
        const csvData = parseCSV(csvContent);
        
        console.log(`Found ${csvData.length} entries in CSV`);
        
        // Process CSV entries
        const newEntries = [];
        csvData.forEach((row, index) => {
            const title = row.title || '';
            const content = row.content || '';
            
            if (!title.trim() || !content.trim()) {
                return; // Skip empty entries
            }
            
            // Clean content by removing greetings and work hour messages
            const cleanedContent = removeGreetingsAndWorkHours(content);
            
            // Generate keywords from cleaned content (ignoring HTML tags)
            const keywords = generateKeywords(cleanedContent);
            
            // Create new entry
            const newEntry = {
                id: maxId + index + 1,
                title: title.trim(),
                content: cleanedContent,
                images: [],
                summary: title.trim(), // Use title as summary
                category: "FAQ", // Default category for CSV entries
                keywords: keywords
            };
            
            newEntries.push(newEntry);
        });
        
        console.log(`Processed ${newEntries.length} entries from CSV`);
        
        // Add new entries to existing data
        const combinedData = [...existingData, ...newEntries];
        
        // Write back to JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify(combinedData, null, 2), 'utf-8');
        
        console.log(`Successfully added ${newEntries.length} entries to ${jsonFilePath}`);
        console.log(`Total entries in JSON file: ${combinedData.length}`);
        
        // Show sample of processed entries
        console.log('\nSample of processed entries:');
        newEntries.slice(0, 3).forEach((entry, i) => {
            console.log(`\nEntry ${i + 1}:`);
            console.log(`Title: ${entry.title}`);
            console.log(`Content preview: ${entry.content.substring(0, 100)}...`);
            console.log(`Keywords: ${entry.keywords.slice(0, 5).join(', ')}`);
        });
        
    } catch (error) {
        console.error('Error processing files:', error.message);
        if (error.code === 'ENOENT') {
            console.error('File not found. Please make sure both CSV and JSON files exist in the current directory.');
        }
    }
}

// Run the processing
processCsvToJson();