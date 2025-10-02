import csv
import json
import re
from typing import List, Dict
import uuid


def clean_html_tags(text: str) -> str:
    """Remove HTML tags from text"""
    # Remove HTML tags
    clean = re.compile("<.*?>")
    text = re.sub(clean, "", text)

    # Replace HTML entities
    text = text.replace("&nbsp;", " ")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    text = text.replace("&quot;", '"')
    text = text.replace("&#39;", "'")

    return text.strip()


def remove_greetings_and_work_hours(text: str) -> str:
    """Remove greeting messages and work hour notifications from text"""
    # List of patterns to remove
    patterns_to_remove = [
        r"\bmerhaba\b",
        r"\biyi çalışmalar dilerim\b",
        r"\biyi çalışmalar\b",
        r"\bmesai saatleri içinde sorabilirsiniz\b",
        r"\bmesai saatlerinde sorabilirsiniz\b",
        r"\bmesai saatleri\b",
        r"\bçalışma saatleri içinde\b",
        r"\bçalışma saatlerinde\b",
        r"\bsize yardımcı olabilirim\b",
        r"\byardımcı olabilirim\b",
        # Add more patterns as needed
    ]

    cleaned_text = text
    for pattern in patterns_to_remove:
        cleaned_text = re.sub(pattern, "", cleaned_text, flags=re.IGNORECASE)

    # Clean up extra whitespace and punctuation
    cleaned_text = re.sub(r"\s+", " ", cleaned_text)
    cleaned_text = re.sub(r"[.,;!?]+\s*$", "", cleaned_text)
    cleaned_text = cleaned_text.strip()

    return cleaned_text


def generate_keywords(text: str) -> List[str]:
    """Generate keywords from cleaned text"""
    # Clean the text first
    clean_text = clean_html_tags(text)
    clean_text = remove_greetings_and_work_hours(clean_text)

    # Convert to lowercase for processing
    text_lower = clean_text.lower()

    # Remove punctuation and split into words
    words = re.findall(r"\b\w+\b", text_lower)

    # Filter out common Turkish stop words and short words
    stop_words = {
        "bir",
        "bu",
        "da",
        "de",
        "den",
        "için",
        "ile",
        "ve",
        "var",
        "olan",
        "olarak",
        "gibi",
        "kadar",
        "sonra",
        "önce",
        "daha",
        "çok",
        "az",
        "büyük",
        "küçük",
        "yeni",
        "eski",
        "iyi",
        "kötü",
        "doğru",
        "yanlış",
        "the",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "up",
        "about",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "between",
        "among",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "can",
        "shall",
    }

    # Filter meaningful words (length > 2 and not stop words)
    meaningful_words = [
        word for word in words if len(word) > 2 and word not in stop_words
    ]

    # Count word frequency and get top keywords
    word_freq = {}
    for word in meaningful_words:
        word_freq[word] = word_freq.get(word, 0) + 1

    # Sort by frequency and get top 10 keywords
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    keywords = [word[0] for word in sorted_words[:10]]

    return keywords


def process_csv_to_json():
    """Process CSV file and add data to JSON file"""
    csv_file_path = "yapay-zeka-veri.csv"
    json_file_path = "zetacad_openai_optimized.json"

    try:
        # Read existing JSON data
        with open(json_file_path, "r", encoding="utf-8") as f:
            existing_data = json.load(f)

        print(f"Loaded existing JSON data with {len(existing_data)} entries")

        # Find the highest existing ID to continue numbering
        max_id = 0
        for item in existing_data:
            if isinstance(item.get("id"), int):
                max_id = max(max_id, item["id"])

        # Read CSV data
        new_entries = []
        with open(csv_file_path, "r", encoding="utf-8") as f:
            csv_reader = csv.DictReader(f)

            for i, row in enumerate(csv_reader, 1):
                title = row.get("title", "").strip()
                content = row.get("content", "").strip()

                if not title or not content:
                    continue

                # Clean content by removing greetings and work hour messages
                cleaned_content = remove_greetings_and_work_hours(content)

                # Generate keywords from cleaned content (ignoring HTML tags)
                keywords = generate_keywords(cleaned_content)

                # Create new entry
                new_entry = {
                    "id": max_id + i,
                    "title": title,
                    "content": cleaned_content,
                    "images": [],
                    "summary": title,  # Use title as summary
                    "category": "FAQ",  # Default category for CSV entries
                    "keywords": keywords,
                }

                new_entries.append(new_entry)

        print(f"Processed {len(new_entries)} entries from CSV")

        # Add new entries to existing data
        combined_data = existing_data + new_entries

        # Write back to JSON file
        with open(json_file_path, "w", encoding="utf-8") as f:
            json.dump(combined_data, f, ensure_ascii=False, indent=2)

        print(f"Successfully added {len(new_entries)} entries to {json_file_path}")
        print(f"Total entries in JSON file: {len(combined_data)}")

        # Show sample of processed entries
        print("\nSample of processed entries:")
        for i, entry in enumerate(new_entries[:3]):
            print(f"\nEntry {i+1}:")
            print(f"Title: {entry['title']}")
            print(f"Content preview: {entry['content'][:100]}...")
            print(f"Keywords: {', '.join(entry['keywords'][:5])}")

    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    process_csv_to_json()
