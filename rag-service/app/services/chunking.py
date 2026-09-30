import re
from typing import List, Dict, Any

class RecursiveChunker:
    """Recursive chunker that breaks documents into ~300-500 word chunks with ~10-20% overlap while preserving headings and metadata."""

    def __init__(self, target_word_count: int = 350, overlap_percent: float = 0.15):
        self.target_word_count = target_word_count
        self.overlap_words = int(target_word_count * overlap_percent)

    def chunk_document(self, doc: Dict[str, Any]) -> List[Dict[str, Any]]:
        text = doc.get("text", "")
        base_metadata = doc.get("metadata", {})

        if not text:
            return []

        # Split by section headers or double newlines
        paragraphs = re.split(r'(\n\n+|\n(?=#+ ))', text)
        chunks = []
        current_words: List[str] = []
        chunk_index = 0
        current_section = "General"

        for p in paragraphs:
            p_str = p.strip()
            if not p_str:
                continue

            # Detect section heading
            if p_str.startswith("#"):
                heading = p_str.lstrip('#').strip().split('\n')[0]
                current_section = heading

            words = p_str.split()
            
            if len(current_words) + len(words) > self.target_word_count and current_words:
                chunk_text = " ".join(current_words)
                chunk_meta = base_metadata.copy()
                chunk_meta.update({
                    "chunk_index": chunk_index,
                    "section": current_section,
                    "word_count": len(current_words)
                })
                chunks.append({
                    "chunk_text": chunk_text,
                    "chunk_index": chunk_index,
                    "metadata": chunk_meta
                })
                chunk_index += 1

                # Retain overlap words from the end of current_words
                current_words = current_words[-self.overlap_words:] if len(current_words) > self.overlap_words else []

            current_words.extend(words)

        # Append final chunk
        if current_words:
            chunk_text = " ".join(current_words)
            chunk_meta = base_metadata.copy()
            chunk_meta.update({
                "chunk_index": chunk_index,
                "section": current_section,
                "word_count": len(current_words)
            })
            chunks.append({
                "chunk_text": chunk_text,
                "chunk_index": chunk_index,
                "metadata": chunk_meta
            })

        return chunks
