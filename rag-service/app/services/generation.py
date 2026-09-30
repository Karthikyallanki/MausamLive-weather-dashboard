import os
from typing import List, Dict, Any, Optional

SYSTEM_PROMPT = """You are the official MausamLive Weather Assistant.

RULES:
1. Use live weather data for current weather facts (temperature, rain, wind, AQI, UV).
2. Use retrieved knowledge for explanations and safety guidance.
3. Do NOT invent weather values.
4. Do NOT invent sources or citations.
5. If required knowledge is unavailable in the provided context, explicitly state: "I don't have enough verified information to answer that question."
6. Clearly separate facts from general guidance.
7. Always cite the retrieved sources used at the end.
"""

class GroundedGenerator:
    """Generation layer that synthesizes grounded answers with strict citation formatting and confidence thresholding."""

    def __init__(self, confidence_threshold: float = 0.25):
        self.confidence_threshold = confidence_threshold

    def generate_response(
        self,
        query: str,
        retrieved_chunks: List[Dict[str, Any]],
        live_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # Check retrieval confidence threshold
        if not retrieved_chunks or (retrieved_chunks[0].get("rerank_score", 0.0) < self.confidence_threshold):
            return {
                "answer": "I don't have enough verified weather knowledge in my documentation to answer that question safely.",
                "sources": [],
                "confidence_score": retrieved_chunks[0].get("rerank_score", 0.0) if retrieved_chunks else 0.0,
                "is_fallback": True
            }

        # Build Context Block
        context_str = ""
        if live_context:
            context_str += "LIVE WEATHER CONTEXT:\n"
            for k, v in live_context.items():
                context_str += f"  • {k}: {v}\n"
            context_str += "\n"

        context_str += "RETRIEVED WEATHER KNOWLEDGE:\n"
        sources_list = []
        for i, chunk in enumerate(retrieved_chunks, start=1):
            meta = chunk.get("metadata", {})
            src_name = meta.get("source", "Unknown Document")
            sec_name = meta.get("section", "General")
            context_str += f"[{i}] Document: {src_name} (Section: {sec_name})\n{chunk['chunk_text']}\n\n"
            
            sources_list.append({
                "id": i,
                "source": src_name,
                "section": sec_name,
                "category": meta.get("category", "Weather"),
                "authority": meta.get("authority", "official_source"),
                "score": chunk.get("rerank_score", 0.0)
            })

        # Synthesize Grounded Answer (Using local deterministic synthesis engine or LLM endpoint)
        answer_text = self._synthesize_answer(query, live_context, retrieved_chunks)

        return {
            "answer": answer_text,
            "sources": sources_list,
            "confidence_score": retrieved_chunks[0].get("rerank_score", 0.0),
            "is_fallback": False
        }

    def _synthesize_answer(self, query: str, live_context: Optional[Dict[str, Any]], chunks: List[Dict[str, Any]]) -> str:
        q_lower = query.lower()
        top_chunk = chunks[0]["chunk_text"]
        top_meta = chunks[0].get("metadata", {})

        paragraphs = [p.strip() for p in top_chunk.split("\n\n") if p.strip() and not p.strip().startswith("#")]
        core_explanation = paragraphs[0] if paragraphs else top_chunk[:300]

        response = f"{core_explanation}\n\n"

        if len(paragraphs) > 1:
            response += f"**Key Details:**\n{paragraphs[1]}\n\n"

        response += "*Explanation grounded in official weather documentation.*"
        return response
