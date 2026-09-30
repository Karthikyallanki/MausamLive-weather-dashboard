import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.loaders.document_loader import DocumentLoader
from app.services.chunking import RecursiveChunker
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreManager

def run_phase3_test():
    knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'rag', 'knowledge'))
    chroma_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'chroma_db'))
    
    print("=== PHASE 3: EMBEDDING & VECTOR STORE INDEXING ===")
    
    # 1. Load Documents
    docs = DocumentLoader.load_directory(knowledge_dir)
    print(f"[1/4] Loaded {len(docs)} documents.")

    # 2. Chunk Documents
    chunker = RecursiveChunker(target_word_count=200, overlap_percent=0.15)
    all_chunks = []
    for doc in docs:
        all_chunks.extend(chunker.chunk_document(doc))
    print(f"[2/4] Created {len(all_chunks)} semantic chunks.")

    # 3. Generate Embeddings
    embedding_service = EmbeddingService()
    chunk_texts = [c["chunk_text"] for c in all_chunks]
    embeddings = embedding_service.embed_texts(chunk_texts)
    print(f"[3/4] Generated {len(embeddings)} vector embeddings (Dim: {len(embeddings[0]) if embeddings else 0}).")

    # 4. Store in ChromaDB
    vdb = VectorStoreManager(db_path=chroma_db_dir)
    added_count = vdb.add_chunks(all_chunks, embeddings)
    stats = vdb.get_stats()
    print(f"[4/4] Ingested {added_count} chunks into Vector DB.")

    print("\n==========================================")
    print("PHASE 3 VERIFICATION STATS:")
    print(f"  • Total Documents Loaded: {len(docs)}")
    print(f"  • Total Chunks Created: {len(all_chunks)}")
    print(f"  • Total Embeddings Generated: {len(embeddings)}")
    print(f"  • Vector DB Status: {stats['status']}")
    print(f"  • Vector DB Backend: {stats['backend']}")
    print(f"  • Total Chunks in DB: {stats['total_chunks']}")
    print("==========================================")

if __name__ == "__main__":
    run_phase3_test()
