import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import alert_explainer, RagAlertRequest

def run_phase10_test():
    print("=== PHASE 10 — USE CASE 4: WEATHER ALERT EXPLAINER TEST ===")

    alerts_to_test = [
        {"alert_type": "Thunderstorm", "location": "Visakhapatnam, India"},
        {"alert_type": "Heavy Rain", "location": "Chennai, India"},
        {"alert_type": "Extreme Heat", "location": "New Delhi, India"},
        {"alert_type": "Strong Wind / Gale", "location": "Kolkata, India"},
        {"alert_type": "Poor Air Quality", "location": "Delhi NCR, India"}
    ]

    mock_live = {
        "temperature": 36,
        "rain_probability": 90,
        "uv_index": 10,
        "aqi": 220
    }

    for idx, item in enumerate(alerts_to_test, start=1):
        print(f"\n-------------------------------------------------------------")
        print(f"USE CASE 4 ALERT [{idx}/5]: {item['alert_type']} ({item['location']})")
        print(f"-------------------------------------------------------------")

        req = RagAlertRequest(
            alert_type=item["alert_type"],
            location=item["location"],
            live_weather=mock_live
        )

        res = alert_explainer(req)

        print(f"WHY: {res['why']}")
        print(f"WHAT SHOULD I DO (Grounded Guidance):\n{res['what_should_i_do']}\n")
        print(f"CITATIONS ({len(res['sources'])}):")
        for s in res['sources']:
            print(f"  • {s['source']} ({s['section']})")

    print("\n==========================================")
    print("PHASE 10 USE CASE 4 TEST PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase10_test()
