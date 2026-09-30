import re
from typing import Dict, Any

class QueryClassifier:
    """Classifies user queries into RAG categories: LIVE_WEATHER, WEATHER_KNOWLEDGE, WEATHER_ADVICE, WEATHER_ALERT, TRAVEL_WEATHER."""

    @staticmethod
    def classify(query: str) -> Dict[str, Any]:
        q = query.lower()

        is_travel = any(word in q for word in ["travel", "trip", "tokyo", "visit", "destination", "going to", "flying to", "vacation"])
        is_alert = any(word in q for word in ["alert", "warning", "why did i receive", "receive this", "alarm"])
        is_advice = any(word in q for word in ["should i", "can i", "good time to", "is it safe", "need protection", "umbrella", "outside", "wear"])
        is_knowledge = any(word in q for word in ["what does", "what is", "meaning", "definition", "explain", "why is", "how is", "scale", "index mean"])
        is_live = any(word in q for word in ["now", "today", "current", "temperature", "forecast", "humidity", "rain today", "wind speed"])

        if is_travel:
            query_type = "TRAVEL_WEATHER"
            needs_live = True
            needs_rag = True
        elif is_alert:
            query_type = "WEATHER_ALERT"
            needs_live = True
            needs_rag = True
        elif is_advice or (needs_live_and_rag := (is_live and is_knowledge)):
            query_type = "WEATHER_ADVICE"
            needs_live = True
            needs_rag = True
        elif is_knowledge:
            query_type = "WEATHER_KNOWLEDGE"
            needs_live = False
            needs_rag = True
        elif is_live:
            query_type = "LIVE_WEATHER"
            needs_live = True
            needs_rag = False
        else:
            query_type = "WEATHER_ADVICE"
            needs_live = True
            needs_rag = True

        return {
            "query": query,
            "query_type": query_type,
            "needs_live": needs_live,
            "needs_rag": needs_rag
        }
