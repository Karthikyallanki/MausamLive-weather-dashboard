import re
from typing import List, Dict, Any, Optional
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreManager

class HybridRetriever:
    """Hybrid retriever combining semantic vector search, exact keyword matching, and metadata filtering."""

    def __init__(self, vector_store: VectorStoreManager, embedding_service: EmbeddingService):
        self.vector_store = vector_store
        self.embedding_service = embedding_service

    def retrieve(
        self,
        query: str,
        top_k: int = 10,
        where_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        # 1. Semantic Retrieval
        query_embedding = self.embedding_service.embed_query(query)
        semantic_results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            where_filter=where_filter
        )

        # 2. Keyword Retrieval (Exact terms, numerical standards like AQI 150, UV 8, PoP %, thunderstorm, humidity)
        query_terms = [t.lower() for t in re.findall(r'\w+', query) if len(t) > 2]
        keyword_results = []

        if hasattr(self.vector_store, '_memory_store') and self.vector_store._memory_store:
            for item in self.vector_store._memory_store:
                doc_text_lower = item["document"].lower()
                matches = sum(1 for term in query_terms if term in doc_text_lower)
                if matches > 0:
                    score = float(matches) / max(len(query_terms), 1)
                    keyword_results.append({
                        "id": item["id"],
                        "chunk_text": item["document"],
                        "metadata": item["metadata"],
                        "keyword_score": score
                    })

        # 3. Merge Semantic & Keyword Results
        merged_dict = {}
        for item in semantic_results:
            cid = item["id"]
            merged_dict[cid] = item
            merged_dict[cid]["semantic_score"] = item.get("similarity", 0.0)
            merged_dict[cid]["keyword_score"] = 0.0

        for item in keyword_results:
            cid = item["id"]
            if cid in merged_dict:
                merged_dict[cid]["keyword_score"] = item["keyword_score"]
            else:
                merged_dict[cid] = item
                merged_dict[cid]["semantic_score"] = 0.0

        # Calculate hybrid initial score (0.7 * semantic + 0.3 * keyword)
        merged_list = []
        for item in merged_dict.values():
            hybrid_score = (0.7 * item.get("semantic_score", 0.0)) + (0.3 * item.get("keyword_score", 0.0))
            item["initial_score"] = hybrid_score
            merged_list.append(item)

        merged_list.sort(key=lambda x: x["initial_score"], reverse=True)
        return merged_list[:top_k]
