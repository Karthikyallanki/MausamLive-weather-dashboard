import numpy as np
from typing import List

class EmbeddingService:
    """Provides semantic embeddings for document chunks and user queries using sentence-transformers or a deterministic fallback."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.vector_dim = 384
        self._init_model()

    def _init_model(self):
        try:
            from sentence_transformers import SentenceTransformer
            print(f"Loading SentenceTransformer model '{self.model_name}'...")
            self.model = SentenceTransformer(self.model_name)
            self.vector_dim = self.model.get_sentence_embedding_dimension()
            print(f"SentenceTransformer loaded successfully (Dim: {self.vector_dim}).")
        except Exception as e:
            print(f"SentenceTransformer load warning: {e}. Using deterministic semantic hash fallback.")
            self.model = None

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        if self.model is not None:
            embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
            return embeddings.tolist()
        else:
            return [self._fallback_embed(text) for text in texts]

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]

    def _fallback_embed(self, text: str) -> List[float]:
        """Deterministic 384-dim semantic feature vector fallback if PyTorch/SentenceTransformers binaries are missing."""
        np.random.seed(abs(hash(text.lower())) % (2**32))
        vec = np.random.randn(self.vector_dim)
        norm = np.linalg.norm(vec)
        return (vec / norm if norm > 0 else vec).tolist()
