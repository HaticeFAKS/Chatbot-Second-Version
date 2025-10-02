const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('zetacad_openai_optimized.json', 'utf-8'));

console.log('Original items:', data.length);

// Create a Map to store unique items by title
const uniqueItems = new Map();

data.forEach(item => {
  const title = item.title;
  
  // If we haven't seen this title before, or if this item has more content, keep it
  if (!uniqueItems.has(title)) {
    uniqueItems.set(title, item);
  } else {
    const existing = uniqueItems.get(title);
    // Keep the item with longer content (assuming it's more complete)
    if (item.content.length > existing.content.length) {
      uniqueItems.set(title, item);
    }
  }
});

// Convert Map back to array
const uniqueData = Array.from(uniqueItems.values());

console.log('Unique items after deduplication:', uniqueData.length);
console.log('Removed duplicates:', data.length - uniqueData.length);

// Create backup of original file
fs.writeFileSync('zetacad_openai_optimized_backup.json', JSON.stringify(data, null, 2));
console.log('Backup created: zetacad_openai_optimized_backup.json');

// Write the deduplicated data
fs.writeFileSync('zetacad_openai_optimized.json', JSON.stringify(uniqueData, null, 2));
console.log('Duplicates removed successfully!');

// Show some statistics
const titleGroups = {};
data.forEach(item => {
  if (!titleGroups[item.title]) {
    titleGroups[item.title] = 0;
  }
  titleGroups[item.title]++;
});

const duplicatedTitles = Object.entries(titleGroups)
  .filter(([title, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

console.log('\nTop 10 most duplicated titles:');
duplicatedTitles.forEach(([title, count]) => {
  console.log(`"${title}": ${count} times`);
});