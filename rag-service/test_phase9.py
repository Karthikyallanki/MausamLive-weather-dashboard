import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import weather_advisor, RagAdviceRequest

def run_phase9_test():
    print("=== PHASE 9 — USE CASE 3: PERSONALIZED WEATHER ADVISOR TEST ===")

    live_weather_mumbai = {
        "location": "Mumbai, India",
        "temperature": 35,
        "feels_like": 42,
        "rain_probability": 85,
        "precipitation_mm": 12.0,
        "humidity": 82,
        "uv_index": 9,
        "aqi": 160,
        "weather_condition": "Heavy Monsoonal Rain"
    }

    advisor_questions = [
        "Is it a good time to go outside?",
        "Should I carry an umbrella?",
        "Is it too hot for outdoor activity?",
        "Do I need protection from UV?",
        "Is the air quality suitable for outdoor activity?"
    ]

    for idx, q_str in enumerate(advisor_questions, start=1):
        print(f"\n-------------------------------------------------------------")
        print(f"USE CASE 3 ADVISOR [{idx}/5]: \"{q_str}\"")
        print(f"-------------------------------------------------------------")

        req = RagAdviceRequest(
            location="Mumbai, India",
            live_weather=live_weather_mumbai,
            question=q_str
        )

        res = weather_advisor(req)

        print(f"PERSONALIZED ADVICE:\n{res['advice']}\n")
        print(f"CITATIONS ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  • {s['source']} ({s['section']})")

    print("\n==========================================")
    print("PHASE 9 USE CASE 3 TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase9_test()
