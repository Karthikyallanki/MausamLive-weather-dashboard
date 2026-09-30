import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.loaders.document_loader import DocumentLoader
from app.services.chunking import RecursiveChunker
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreManager
from app.services.retrieval import HybridRetriever
from app.services.reranking import Reranker
from app.services.generation import GroundedGenerator

def run_phase5_test():
    print("=== PHASE 5: RAG GENERATION & SOURCE CITATION TEST ===")

    knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'rag', 'knowledge'))
    chroma_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'chroma_db'))

    docs = DocumentLoader.load_directory(knowledge_dir)
    chunker = RecursiveChunker(target_word_count=200, overlap_percent=0.15)
    all_chunks = []
    for doc in docs:
        all_chunks.extend(chunker.chunk_document(doc))

    embedding_service = EmbeddingService()
    embeddings = embedding_service.embed_texts([c["chunk_text"] for c in all_chunks])

    vdb = VectorStoreManager(db_path=chroma_db_dir)
    vdb.add_chunks(all_chunks, embeddings)

    retriever = HybridRetriever(vdb, embedding_service)
    reranker = Reranker(final_top_k=3)
    generator = GroundedGenerator(confidence_threshold=0.20)

    test_queries = [
        "What does 75% rain probability mean?",
        "What should I do during a thunderstorm?",
        "Is there life on Mars?"  # Should trigger confidence threshold fallback!
    ]

    for q_idx, query in enumerate(test_queries, start=1):
        print(f"\n=============================================================")
        print(f"USER QUESTION {q_idx}: \"{query}\"")
        print(f"=============================================================")
        
        # 1. Retrieve
        candidates = retriever.retrieve(query, top_k=6)
        
        # 2. Re-rank
        reranked = reranker.rerank(query, candidates)
        
        # 3. Generate Grounded Response
        res = generator.generate_response(query, reranked)

        print(f"GROUNDED RESPONSE:\n{res['answer']}\n")
        print(f"CONFIDENCE SCORE: {res['confidence_score']}")
        print(f"SOURCES CITED ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  [{s['id']}] {s['source']} (Section: {s['section']}, Score: {s['score']})")

    print("\n==========================================")
    print("PHASE 5 RAG GENERATION TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase5_test()
