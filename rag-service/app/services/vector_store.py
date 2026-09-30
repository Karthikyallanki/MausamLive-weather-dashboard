import os
import uuid
from typing import List, Dict, Any, Optional

class VectorStoreManager:
    """Manages persistent ChromaDB vector store collection for MausamLive RAG knowledge chunks."""

    def __init__(self, db_path: str = "chroma_db", collection_name: str = "mausamlive_knowledge"):
        self.db_path = os.path.abspath(db_path)
        self.collection_name = collection_name
        self.client = None
        self.collection = None
        self._init_chroma()

    def _init_chroma(self):
        try:
            import chromadb
            from chromadb.config import Settings
            
            os.makedirs(self.db_path, exist_ok=True)
            self.client = chromadb.PersistentClient(path=self.db_path)
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            print(f"ChromaDB persistent store initialized at: {self.db_path}")
        except Exception as e:
            print(f"ChromaDB initialization notice: {e}. Operating with lightweight persistent memory store.")
            self.client = None
            self.collection = None
            self._memory_store = []

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]) -> int:
        if not chunks or len(chunks) != len(embeddings):
            raise ValueError("Chunks and embeddings count mismatch.")

        ids = [f"{c['metadata']['source']}_chunk_{c['chunk_index']}_{uuid.uuid4().hex[:6]}" for c in chunks]
        documents = [c["chunk_text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]

        if self.collection is not None:
            self.collection.upsert(
                ids=ids,
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas
            )
            return len(ids)
        else:
            for i, doc in enumerate(documents):
                self._memory_store.append({
                    "id": ids[i],
                    "document": doc,
                    "embedding": embeddings[i],
                    "metadata": metadatas[i]
                })
            return len(ids)

    def search(self, query_embedding: List[float], top_k: int = 5, where_filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if self.collection is not None:
            query_kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": top_k
            }
            if where_filter:
                query_kwargs["where"] = where_filter

            results = self.collection.query(**query_kwargs)
            
            formatted = []
            if results and results.get("ids") and results["ids"][0]:
                for i in range(len(results["ids"][0])):
                    formatted.append({
                        "id": results["ids"][0][i],
                        "chunk_text": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": results["distances"][0][i] if "distances" in results else 0.0,
                        "similarity": 1.0 - (results["distances"][0][i] if "distances" in results else 0.0)
                    })
            return formatted
        else:
            # InMemory fallback search using cosine similarity
            import numpy as np
            q_vec = np.array(query_embedding)
            norm_q = np.linalg.norm(q_vec)

            scored = []
            for item in self._memory_store:
                if where_filter:
                    match = all(item["metadata"].get(k) == v for k, v in where_filter.items())
                    if not match:
                        continue

                d_vec = np.array(item["embedding"])
                norm_d = np.linalg.norm(d_vec)
                sim = float(np.dot(q_vec, d_vec) / (norm_q * norm_d)) if norm_q > 0 and norm_d > 0 else 0.0

                scored.append({
                    "id": item["id"],
                    "chunk_text": item["document"],
                    "metadata": item["metadata"],
                    "similarity": sim
                })

            scored.sort(key=lambda x: x["similarity"], reverse=True)
            return scored[:top_k]

    def get_stats(self) -> Dict[str, Any]:
        if self.collection is not None:
            count = self.collection.count()
            return {
                "status": "active",
                "backend": "ChromaDB PersistentStore",
                "collection_name": self.collection_name,
                "total_chunks": count,
                "db_path": self.db_path
            }
        else:
            return {
                "status": "active",
                "backend": "MemoryVectorStore (Fallback)",
                "collection_name": self.collection_name,
                "total_chunks": len(self._memory_store),
                "db_path": self.db_path
            }
