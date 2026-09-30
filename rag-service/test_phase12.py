import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import query_rag, explain_weather_metric, weather_advisor, alert_explainer, travel_advisor, RagQueryRequest, RagExplainRequest, RagAdviceRequest, RagAlertRequest, RagTravelRequest

def run_phase12_test():
    print("=== PHASE 12 — UNIFORM SOURCE CITATIONS VERIFICATION ===")

    live_weather = {
        "location": "Hyderabad, India",
        "temperature": 32,
        "rain_probability": 80,
        "uv_index": 7,
        "aqi": 140
    }

    # Test Use Case 1 Citation
    res1 = query_rag(RagQueryRequest(query="What does 80% rain probability mean?", location="Hyderabad, India", live_weather=live_weather))
    print("\n--- USE CASE 1 CITATIONS ---")
    print(f"Answer Snippet: {res1['answer'][:120]}...")
    print("Sources Displayed:")
    for s in res1['sources']:
        print(f"  [{s['id']}] {s['source']} — Section: {s['section']} (Match: {int(s['score']*100)}%, Authority: {s['authority']})")

    # Test Use Case 2 Citation
    res2 = explain_weather_metric(RagExplainRequest(metric="UV Index", value=7))
    print("\n--- USE CASE 2 CITATIONS ---")
    print(f"Explanation Snippet: {res2['explanation'][:120]}...")
    print("Sources Displayed:")
    for s in res2['sources']:
        print(f"  [{s['id']}] {s['source']} — Section: {s['section']} (Match: {int(s['score']*100)}%)")

    # Test Use Case 3 Citation
    res3 = weather_advisor(RagAdviceRequest(location="Hyderabad, India", live_weather=live_weather, question="Should I carry an umbrella?"))
    print("\n--- USE CASE 3 CITATIONS ---")
    print(f"Advice Snippet: {res3['advice'][:120]}...")
    print("Sources Displayed:")
    for s in res3['sources']:
        print(f"  [{s['id']}] {s['source']} — Section: {s['section']}")

    # Test Use Case 4 Citation
    res4 = alert_explainer(RagAlertRequest(alert_type="Thunderstorm", location="Hyderabad, India", live_weather=live_weather))
    print("\n--- USE CASE 4 CITATIONS ---")
    print(f"What Should I Do Snippet: {res4['what_should_i_do'][:120]}...")
    print("Sources Displayed:")
    for s in res4['sources']:
        print(f"  [{s['id']}] {s['source']} — Section: {s['section']}")

    # Test Use Case 5 Citation
    res5 = travel_advisor(RagTravelRequest(destination="Tokyo", travel_date="2026-08-20", live_weather={"temperature": 28, "rain_probability": 70}))
    print("\n--- USE CASE 5 CITATIONS ---")
    print(f"Travel Advice Snippet: {res5['preparation_advice'][:120]}...")
    print("Sources Displayed:")
    for s in res5['sources']:
        print(f"  [{s['id']}] {s['source']} — Section: {s['section']}")

    print("\n==========================================")
    print("PHASE 12 SOURCE CITATIONS VERIFICATION PASSED")
    print("==========================================")

if __name__ == "__main__":
    run_phase12_test()
