from typing import Dict, Any, List, Optional

class HybridContextBuilder:
    """Builds standardized hybrid context combining live weather metrics and retrieved RAG knowledge."""

    @staticmethod
    def build_context(
        user_query: str,
        query_classification: Dict[str, Any],
        live_weather: Optional[Dict[str, Any]],
        retrieved_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        
        normalized_live = None
        if live_weather and query_classification.get("needs_live"):
            normalized_live = {
                "location": live_weather.get("location", "Selected Location"),
                "temperature": live_weather.get("temperature", live_weather.get("temp")),
                "feels_like": live_weather.get("feels_like", live_weather.get("feelsLike")),
                "rain_probability": live_weather.get("rain_probability", live_weather.get("pop", live_weather.get("rainProbability"))),
                "precipitation_mm": live_weather.get("precipitation_mm", live_weather.get("rainfall", 0.0)),
                "humidity": live_weather.get("humidity"),
                "wind_kmh": live_weather.get("wind_kmh", live_weather.get("windSpeed")),
                "uv_index": live_weather.get("uv_index", live_weather.get("uvIndex")),
                "aqi": live_weather.get("aqi", live_weather.get("airQuality")),
                "weather_condition": live_weather.get("weather_condition", live_weather.get("condition", "Current Weather")),
                "updated_at": live_weather.get("updated_at", "Just now")
            }

        return {
            "query": user_query,
            "query_type": query_classification.get("query_type"),
            "live_weather": normalized_live,
            "retrieved_chunks": retrieved_chunks,
            "total_chunks": len(retrieved_chunks)
        }

    @staticmethod
    def format_hybrid_answer(
        user_query: str,
        live_weather: Optional[Dict[str, Any]],
        retrieved_chunks: List[Dict[str, Any]]
    ) -> str:
        if not live_weather:
            return ""

        loc = live_weather.get("location", "your area")
        pop = live_weather.get("rain_probability", live_weather.get("pop", 0))
        precip = live_weather.get("precipitation_mm", 0.0)
        temp = live_weather.get("temperature", 30)
        feels = live_weather.get("feels_like", temp)
        condition = live_weather.get("weather_condition", "Clear")

        q_lower = user_query.lower()

        answer = ""
        if "umbrella" in q_lower or "rain" in q_lower:
            if pop >= 60:
                answer += f"**Yes, carrying an umbrella is strongly advised in {loc} today.**\n\n"
                answer += f"• **Live Forecast:** Rain probability is **{pop}%** with **{precip} mm** expected precipitation ({condition}).\n"
            elif pop >= 30:
                answer += f"**Carrying a light umbrella or raincoat is recommended in {loc}.**\n\n"
                answer += f"• **Live Forecast:** Rain probability is **{pop}%** ({condition}).\n"
            else:
                answer += f"**Rain is unlikely in {loc} today.**\n\n"
                answer += f"• **Live Forecast:** Rain probability is only **{pop}%** ({condition}).\n"

        elif "hot" in q_lower or "outside" in q_lower or "temperature" in q_lower:
            answer += f"**Current weather conditions for {loc}:**\n"
            answer += f"• **Temperature:** {temp}°C (Feels like {feels}°C)\n"
            answer += f"• **Condition:** {condition}\n\n"

        # Attach RAG Explanation / Safety Guidance from top retrieved chunk
        if retrieved_chunks:
            top_text = retrieved_chunks[0]["chunk_text"]
            paragraphs = [p.strip() for p in top_text.split("\n\n") if p.strip() and not p.strip().startswith("#")]
            guidance = paragraphs[0] if paragraphs else top_text[:250]
            answer += f"**Weather Guidance:**\n{guidance}"

        return answer
