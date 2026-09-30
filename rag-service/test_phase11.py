import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import travel_advisor, RagTravelRequest

def run_phase11_test():
    print("=== PHASE 11 — USE CASE 5: TRAVEL WEATHER ASSISTANT TEST ===")

    destinations_to_test = [
        {
            "destination": "Tokyo",
            "travel_date": "2026-08-20",
            "weather": {"temperature": 28, "rain_probability": 70, "condition": "Rainy"}
        },
        {
            "destination": "London",
            "travel_date": "2026-08-22",
            "weather": {"temperature": 18, "rain_probability": 40, "condition": "Overcast"}
        },
        {
            "destination": "Dubai",
            "travel_date": "2026-08-25",
            "weather": {"temperature": 40, "rain_probability": 0, "condition": "Sunny"}
        }
    ]

    for idx, item in enumerate(destinations_to_test, start=1):
        print(f"\n-------------------------------------------------------------")
        print(f"USE CASE 5 TRAVEL [{idx}/3]: {item['destination']} ({item['travel_date']})")
        print(f"-------------------------------------------------------------")

        req = RagTravelRequest(
            destination=item["destination"],
            travel_date=item["travel_date"],
            question=f"What should I pack and prepare for my travel to {item['destination']} with forecast temperature {item['weather']['temperature']}°C and rain probability {item['weather']['rain_probability']}%?",
            live_weather=item["weather"]
        )

        res = travel_advisor(req)

        print(f"PREPARATION ADVICE:\n{res['preparation_advice']}\n")
        print(f"CITATIONS ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  • {s['source']} ({s['section']})")

    print("\n==========================================")
    print("PHASE 11 USE CASE 5 TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase11_test()
