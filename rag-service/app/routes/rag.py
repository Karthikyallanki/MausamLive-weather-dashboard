from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.loaders.document_loader import DocumentLoader
from app.services.chunking import RecursiveChunker
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreManager
from app.services.retrieval import HybridRetriever
from app.services.reranking import Reranker
from app.services.generation import GroundedGenerator
from app.services.query_classifier import QueryClassifier
from app.services.context_builder import HybridContextBuilder

router = APIRouter(prefix="/api/rag", tags=["RAG Services"])

# Service Singletons Initialization
embedding_service = EmbeddingService()
vector_store = VectorStoreManager(db_path="chroma_db")
retriever = HybridRetriever(vector_store, embedding_service)
reranker = Reranker(final_top_k=4)
generator = GroundedGenerator(confidence_threshold=0.20)

# Ingest Knowledge on Startup if DB is empty
def _auto_ingest_knowledge():
    stats = vector_store.get_stats()
    if stats.get("total_chunks", 0) == 0:
        import os
        k_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "rag", "knowledge"))
        docs = DocumentLoader.load_directory(k_dir)
        chunker = RecursiveChunker(target_word_count=200, overlap_percent=0.15)
        all_chunks = []
        for doc in docs:
            all_chunks.extend(chunker.chunk_document(doc))
        if all_chunks:
            embeddings = embedding_service.embed_texts([c["chunk_text"] for c in all_chunks])
            vector_store.add_chunks(all_chunks, embeddings)

_auto_ingest_knowledge()

# Data Schemas
class RagQueryRequest(BaseModel):
    query: str
    location: Optional[str] = "Hyderabad, India"
    live_weather: Optional[Dict[str, Any]] = None

class RagExplainRequest(BaseModel):
    metric: str  # e.g., "rain_probability", "uv_index", "aqi", "humidity", "wind"
    value: Optional[Any] = None
    query: Optional[str] = None

class RagAdviceRequest(BaseModel):
    location: str
    live_weather: Dict[str, Any]
    question: Optional[str] = "Should I carry an umbrella today?"

class RagAlertRequest(BaseModel):
    alert_type: str
    location: str
    live_weather: Dict[str, Any]

class RagTravelRequest(BaseModel):
    destination: str
    travel_date: Optional[str] = "Today"
    question: Optional[str] = "What should I prepare for this weather?"
    live_weather: Dict[str, Any]


@router.post("/query")
def query_rag(req: RagQueryRequest):
    classification = QueryClassifier.classify(req.query)
    candidates = retriever.retrieve(req.query, top_k=6)
    reranked = reranker.rerank(req.query, candidates)

    if req.live_weather and classification["needs_live"]:
        custom_answer = HybridContextBuilder.format_hybrid_answer(req.query, req.live_weather, reranked)
        gen_res = generator.generate_response(req.query, reranked, req.live_weather)
        if custom_answer:
            gen_res["answer"] = custom_answer
    else:
        gen_res = generator.generate_response(req.query, reranked, req.live_weather)

    return {
        "query": req.query,
        "classification": classification,
        "answer": gen_res["answer"],
        "sources": gen_res["sources"],
        "confidence_score": gen_res["confidence_score"]
    }


@router.post("/explain")
def explain_weather_metric(req: RagExplainRequest):
    q_str = req.query or f"What does {req.metric} mean and how is {req.value} interpreted?"
    candidates = retriever.retrieve(q_str, top_k=5)
    reranked = reranker.rerank(q_str, candidates)
    res = generator.generate_response(q_str, reranked)
    return {
        "metric": req.metric,
        "value": req.value,
        "explanation": res["answer"],
        "sources": res["sources"]
    }


@router.post("/advice")
def weather_advisor(req: RagAdviceRequest):
    q_str = req.question or "Is it a good time to go outside?"
    candidates = retriever.retrieve(q_str, top_k=5)
    reranked = reranker.rerank(q_str, candidates)
    
    hybrid_ans = HybridContextBuilder.format_hybrid_answer(q_str, req.live_weather, reranked)
    res = generator.generate_response(q_str, reranked, req.live_weather)
    
    return {
        "location": req.location,
        "advice": hybrid_ans or res["answer"],
        "sources": res["sources"],
        "live_weather": req.live_weather
    }


@router.post("/alert-explanation")
def alert_explainer(req: RagAlertRequest):
    q_str = f"What should I do during a {req.alert_type} alert safety guidance?"
    candidates = retriever.retrieve(q_str, top_k=5)
    reranked = reranker.rerank(q_str, candidates)
    res = generator.generate_response(q_str, reranked, req.live_weather)

    return {
        "alert_type": req.alert_type,
        "why": f"Current weather alert detected for {req.location}: {req.alert_type}.",
        "what_should_i_do": res["answer"],
        "sources": res["sources"]
    }


@router.post("/travel-advice")
def travel_advisor(req: RagTravelRequest):
    q_str = req.question or f"What should I pack and prepare for {req.destination} trip weather?"
    candidates = retriever.retrieve(q_str, top_k=5)
    reranked = reranker.rerank(q_str, candidates)
    res = generator.generate_response(q_str, reranked, req.live_weather)

    return {
        "destination": req.destination,
        "travel_date": req.travel_date,
        "preparation_advice": res["answer"],
        "sources": res["sources"],
        "live_weather": req.live_weather
    }


@router.get("/stats")
def get_stats():
    return vector_store.get_stats()
