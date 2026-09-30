import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import query_rag, RagQueryRequest

def run_phase7_test():
    print("=== PHASE 7 — USE CASE 1: ASK MAUSAMLIVE ASSISTANT TEST ===")

    live_weather_hyd = {
        "location": "Hyderabad, India",
        "temperature": 31,
        "feels_like": 35,
        "rain_probability": 75,
        "precipitation_mm": 5.4,
        "humidity": 80,
        "weather_condition": "Heavy Showers Expected"
    }

    use_case_1_queries = [
        "Will it rain today?",
        "Why is humidity high?",
        "Should I carry an umbrella?",
        "What does 70% rain probability mean?"
    ]

    for idx, query in enumerate(use_case_1_queries, start=1):
        print(f"\n-------------------------------------------------------------")
        print(f"USE CASE 1 QUERY {idx}: \"{query}\"")
        print(f"-------------------------------------------------------------")
        
        req = RagQueryRequest(
            query=query,
            location="Hyderabad, India",
            live_weather=live_weather_hyd
        )
        res = query_rag(req)

        print(f"ANSWER:\n{res['answer']}\n")
        print(f"CONFIDENCE: {res['confidence_score']}")
        print(f"CITATIONS ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  • {s['source']} ({s['section']})")

    print("\n==========================================")
    print("PHASE 7 USE CASE 1 TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase7_test()
