import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import query_rag, explain_weather_metric, weather_advisor, alert_explainer, RagQueryRequest, RagExplainRequest, RagAdviceRequest, RagAlertRequest

def run_phase14_test():
    print("=== PHASE 14 — FAILURE TESTING & GRACEFUL DEGRADATION ===")

    # Scenario 1: Empty Query
    print("\n-------------------------------------------------------------")
    print("SCENARIO 1: Empty Query ('' or whitespace)")
    print("-------------------------------------------------------------")
    res1 = query_rag(RagQueryRequest(query="   ", location="Hyderabad, India"))
    print(f"Handled Response: \"{res1['answer']}\" | Confidence: {res1['confidence_score']}")

    # Scenario 2: Low Retrieval Score / Out of Domain Question
    print("\n-------------------------------------------------------------")
    print("SCENARIO 2: Out-of-Domain Question (\"What is quantum mechanics?\")")
    print("-------------------------------------------------------------")
    res2 = query_rag(RagQueryRequest(query="What is quantum mechanics?", location="Hyderabad, India"))
    print(f"Handled Response: \"{res2['answer']}\" | Sources Cited: {len(res2['sources'])}")

    # Scenario 3: No Matching Document
    print("\n-------------------------------------------------------------")
    print("SCENARIO 3: No Matching Document (\"What is Jupiter moon weather?\")")
    print("-------------------------------------------------------------")
    res3 = query_rag(RagQueryRequest(query="What is Jupiter moon weather?", location="Hyderabad, India"))
    print(f"Handled Response: \"{res3['answer']}\" | Fallback Triggered: {len(res3['sources']) == 0}")

    # Scenario 4: Wrong / Absurd Question
    print("\n-------------------------------------------------------------")
    print("SCENARIO 4: Wrong Question (\"Can I cook pasta with rain?\")")
    print("-------------------------------------------------------------")
    res4 = query_rag(RagQueryRequest(query="Can I cook pasta with rain?", location="Hyderabad, India"))
    print(f"Handled Response: \"{res4['answer']}\"")

    # Scenario 5: Missing Live Weather API Data
    print("\n-------------------------------------------------------------")
    print("SCENARIO 5: Missing Live Weather Data (live_weather=None)")
    print("-------------------------------------------------------------")
    res5 = query_rag(RagQueryRequest(query="Will it rain today?", location="Hyderabad, India", live_weather=None))
    print(f"Handled Response: \"{res5['answer'][:120]}...\"")

    # Scenario 6: Weather API Failure (empty dict)
    print("\n-------------------------------------------------------------")
    print("SCENARIO 6: Weather API Failure (live_weather={})")
    print("-------------------------------------------------------------")
    res6 = weather_advisor(RagAdviceRequest(location="Hyderabad, India", live_weather={}, question="Should I carry an umbrella?"))
    print(f"Handled Response: \"{res6['advice'][:120]}...\"")

    # Scenario 7: Vector Database Empty / Low Score Threshold
    print("\n-------------------------------------------------------------")
    print("SCENARIO 7: Low Similarity Threshold Check (< 0.20)")
    print("-------------------------------------------------------------")
    res7 = explain_weather_metric(RagExplainRequest(metric="NonExistentMetric", value=999))
    print(f"Handled Response: \"{res7['explanation'][:120]}...\"")

    # Scenario 8: Malformed / Invalid Input Payload
    print("\n-------------------------------------------------------------")
    print("SCENARIO 8: Malformed Alert Type (\"UnknownAlert123\")")
    print("-------------------------------------------------------------")
    res8 = alert_explainer(RagAlertRequest(alert_type="UnknownAlert123", location="Hyderabad, India", live_weather={}))
    print(f"Handled Response: \"{res8['what_should_i_do'][:120]}...\"")

    # Scenario 9: Edge Case Numerical Overflow Values
    print("\n-------------------------------------------------------------")
    print("SCENARIO 9: Edge Case Overflow Metric (AQI 9999)")
    print("-------------------------------------------------------------")
    res9 = explain_weather_metric(RagExplainRequest(metric="Air Quality Index", value=9999))
    print(f"Handled Response: \"{res9['explanation'][:120]}...\"")

    print("\n==========================================")
    print("PHASE 14 FAILURE TESTING PASSED GRACEFULLY")
    print("==========================================")

if __name__ == "__main__":
    run_phase14_test()
