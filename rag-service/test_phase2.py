import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.loaders.document_loader import DocumentLoader
from app.services.chunking import RecursiveChunker

def run_phase2_test():
    knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'rag', 'knowledge'))
    print(f"Loading knowledge documents from: {knowledge_dir}")

    docs = DocumentLoader.load_directory(knowledge_dir)
    print(f"\n[OK] Loaded {len(docs)} document(s).")

    chunker = RecursiveChunker(target_word_count=200, overlap_percent=0.15)
    all_chunks = []

    for doc in docs:
        chunks = chunker.chunk_document(doc)
        all_chunks.extend(chunks)
        print(f"\n--- Document: {doc['metadata']['source']} ({doc['metadata']['category']}) ---")
        print(f"Raw Length: {doc['metadata']['length_chars']} chars")
        print(f"Generated Chunks: {len(chunks)}")
        if chunks:
            sample = chunks[0]
            print(f"Sample Chunk 0 Metadata: {sample['metadata']}")
            print(f"Sample Chunk 0 Snippet:\n  \"{sample['chunk_text'][:150]}...\"")

    print(f"\n==========================================")
    print(f"PHASE 2 SUMMARY: {len(docs)} Documents -> {len(all_chunks)} Chunks with Metadata")
    print(f"==========================================")

if __name__ == "__main__":
    run_phase2_test()
