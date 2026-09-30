import re
from typing import List, Dict, Any

class Reranker:
    """Re-ranking stage to boost chunk relevance based on exact query term overlap, title matches, and semantic alignment."""

    def __init__(self, final_top_k: int = 4):
        self.final_top_k = final_top_k

    def rerank(self, query: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        query_words = set(re.findall(r'\w+', query.lower())) - {'what', 'does', 'mean', 'the', 'is', 'how', 'why', 'should', 'for', 'during', 'and', 'are'}
        
        reranked = []
        for cand in candidates:
            chunk_text = cand.get("chunk_text", "").lower()
            metadata = cand.get("metadata", {})
            section = str(metadata.get("section", "")).lower()
            category = str(metadata.get("category", "")).lower()

            # Base score from hybrid retrieval
            base_score = cand.get("initial_score", 0.5)

            # Query term coverage bonus
            matched_words = sum(1 for word in query_words if word in chunk_text)
            coverage = matched_words / max(len(query_words), 1)

            # Heading/Category match bonus
            category_bonus = 0.2 if any(word in category for word in query_words) else 0.0
            section_bonus = 0.15 if any(word in section for word in query_words) else 0.0

            final_score = (0.5 * base_score) + (0.3 * coverage) + category_bonus + section_bonus
            
            cand_copy = cand.copy()
            cand_copy["rerank_score"] = round(final_score, 4)
            reranked.append(cand_copy)

        reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
        return reranked[:self.final_top_k]
