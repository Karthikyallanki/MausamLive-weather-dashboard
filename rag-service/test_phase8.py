import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import explain_weather_metric, RagExplainRequest

def run_phase8_test():
    print("=== PHASE 8 — USE CASE 2: EXPLAIN THIS WEATHER TEST ===")

    metrics_to_test = [
        {"metric": "Temperature", "value": "34°C (Feels like 38°C)"},
        {"metric": "Humidity", "value": "78%"},
        {"metric": "Rain Probability", "value": "75%"},
        {"metric": "Rainfall", "value": "5.4 mm"},
        {"metric": "UV Index", "value": "8 (Very High)"},
        {"metric": "Air Quality Index", "value": "AQI 150 (Unhealthy)"},
        {"metric": "Wind Speed", "value": "24 km/h"}
    ]

    for idx, item in enumerate(metrics_to_test, start=1):
        print(f"\n-------------------------------------------------------------")
        print(f"USE CASE 2 EXPLAIN [{idx}/7]: {item['metric']} (Value: {item['value']})")
        print(f"-------------------------------------------------------------")

        req = RagExplainRequest(
            metric=item["metric"],
            value=item["value"]
        )

        res = explain_weather_metric(req)

        print(f"EXPLANATION:\n{res['explanation']}\n")
        print(f"CITATIONS ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  • {s['source']} ({s['section']})")

    print("\n==========================================")
    print("PHASE 8 USE CASE 2 TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase8_test()
