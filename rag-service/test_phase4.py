import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.loaders.document_loader import DocumentLoader
from app.services.chunking import RecursiveChunker
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreManager
from app.services.retrieval import HybridRetriever
from app.services.reranking import Reranker

def run_phase4_test():
    print("=== PHASE 4: HYBRID RETRIEVAL & RE-RANKING PLAYGROUND ===")

    # Initialize Index
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

    test_queries = [
        "What does rain probability mean?",
        "What does UV index mean?",
        "What does AQI mean?",
        "What does humidity mean?",
        "What should I do during a thunderstorm?"
    ]

    for q_idx, query in enumerate(test_queries, start=1):
        print(f"\n-------------------------------------------------------------")
        print(f"QUERY {q_idx}: \"{query}\"")
        print(f"-------------------------------------------------------------")
        
        # Retrieval Stage
        top_candidates = retriever.retrieve(query, top_k=6)
        print(f"  • Top-K Hybrid Candidates Retrieved: {len(top_candidates)}")
        
        # Re-ranking Stage
        final_results = reranker.rerank(query, top_candidates)
        print(f"  • Re-ranked Top Results (Count: {len(final_results)}):")
        
        for r_idx, res in enumerate(final_results, start=1):
            meta = res["metadata"]
            print(f"    [{r_idx}] Score: {res['rerank_score']} | Source: {meta['source']} | Section: {meta['section']}")
            print(f"        Snippet: \"{res['chunk_text'][:120]}...\"")

    print("\n==========================================")
    print("PHASE 4 RETRIEVAL PLAYGROUND TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase4_test()
