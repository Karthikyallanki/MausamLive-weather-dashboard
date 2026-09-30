import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.query_classifier import QueryClassifier
from app.services.context_builder import HybridContextBuilder
from app.routes.rag import query_rag, RagQueryRequest

def run_phase6_test():
    print("=== PHASE 6: HYBRID LIVE WEATHER + RAG INTEGRATION TEST ===")

    # Simulated Live Weather payload (representing OpenMeteo real-time response for Hyderabad)
    live_weather_data = {
        "location": "Hyderabad, India",
        "temperature": 32,
        "feels_like": 36,
        "rain_probability": 82,
        "precipitation_mm": 6.8,
        "humidity": 79,
        "wind_kmh": 16,
        "uv_index": 7,
        "aqi": 120,
        "weather_condition": "Thunderstorms Likely"
    }

    test_queries = [
        "Should I carry an umbrella in Hyderabad today?",
        "Why does it feel so hot right now?",
        "What does AQI 120 mean?"
    ]

    for q_idx, q_str in enumerate(test_queries, start=1):
        print(f"\n=============================================================")
        print(f"QUERY {q_idx}: \"{q_str}\"")
        print(f"=============================================================")

        req = RagQueryRequest(
            query=q_str,
            location="Hyderabad, India",
            live_weather=live_weather_data
        )

        res = query_rag(req)

        print(f"CLASSIFICATION: {res['classification']['query_type']} (Needs Live: {res['classification']['needs_live']}, Needs RAG: {res['classification']['needs_rag']})")
        print(f"\nGROUNDED HYBRID ANSWER:\n{res['answer']}\n")
        print(f"CONFIDENCE SCORE: {res['confidence_score']}")
        print(f"CITATIONS ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  • {s['source']} (Section: {s['section']})")

    print("\n==========================================")
    print("PHASE 6 HYBRID LIVE WEATHER + RAG TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase6_test()
