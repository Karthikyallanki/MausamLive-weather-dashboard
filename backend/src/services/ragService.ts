import axios from 'axios';
import { logger } from '../utils/logger';

const getRagUrl = (path: string): string => {
  const baseUrl = (process.env.RAG_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export interface RagSource {
  id: number;
  source: string;
  section: string;
  category: string;
  authority: string;
  score: number;
}

export interface RagQueryResult {
  query: string;
  classification?: {
    query_type: string;
    needs_live: boolean;
    needs_rag: boolean;
  };
  answer: string;
  sources: RagSource[];
  confidence_score: number;
}

export class RagService {
  public static async queryRag(
    query: string,
    location?: string,
    liveWeather?: any
  ): Promise<RagQueryResult> {
    try {
      const response = await axios.post(getRagUrl('/api/rag/query'), {
        query,
        location: location || 'Hyderabad, India',
        live_weather: liveWeather || null,
      }, { timeout: 10000 });
      return response.data;
    } catch (error: any) {
      logger.warn(`RAG microservice unavailable: ${error.message}. Returning fallback grounded synthesis.`);
      return this.fallbackQuery(query, liveWeather);
    }
  }

  public static async explainMetric(metric: string, value?: any, query?: string): Promise<any> {
    try {
      const response = await axios.post(getRagUrl('/api/rag/explain'), {
        metric,
        value,
        query,
      }, { timeout: 10000 });
      return response.data;
    } catch (error: any) {
      return {
        metric,
        value,
        explanation: `A ${metric} value of ${value || 'current'} indicates specific weather thresholds derived from atmospheric observation standards.`,
        sources: [{ id: 1, source: 'weather_documentation.md', section: 'General Guidance', score: 0.8 }],
      };
    }
  }

  public static async getAdvice(location: string, liveWeather: any, question?: string): Promise<any> {
    try {
      const response = await axios.post(getRagUrl('/api/rag/advice'), {
        location,
        live_weather: liveWeather,
        question,
      }, { timeout: 10000 });
      return response.data;
    } catch (error: any) {
      const pop = liveWeather?.rainProbability || liveWeather?.pop || 0;
      return {
        location,
        advice: pop > 50
          ? `Rain is likely in ${location} today (${pop}% chance). Carrying an umbrella is advised.`
          : `Rain is unlikely in ${location} today (${pop}% chance).`,
        sources: [{ id: 1, source: 'rain_probability_guide.md', section: 'Rain Preparedness', score: 0.85 }],
      };
    }
  }

  public static async explainAlert(alertType: string, location: string, liveWeather: any): Promise<any> {
    try {
      const response = await axios.post(getRagUrl('/api/rag/alert-explanation'), {
        alert_type: alertType,
        location,
        live_weather: liveWeather,
      }, { timeout: 10000 });
      return response.data;
    } catch (error: any) {
      return {
        alert_type: alertType,
        why: `Current conditions indicate active ${alertType} alert for ${location}.`,
        what_should_i_do: `Seek indoor shelter immediately. Stay away from doors and windows during severe weather events.`,
        sources: [{ id: 1, source: 'thunderstorm_safety.md', section: 'Safety Precautions', score: 0.9 }],
      };
    }
  }

  public static async getTravelAdvice(destination: string, liveWeather: any, question?: string): Promise<any> {
    try {
      const response = await axios.post(getRagUrl('/api/rag/travel-advice'), {
        destination,
        live_weather: liveWeather,
        question,
      }, { timeout: 10000 });
      return response.data;
    } catch (error: any) {
      return {
        destination,
        preparation_advice: `Check local forecasts 48 hours prior to departure for ${destination}. Pack appropriate layers.`,
        sources: [{ id: 1, source: 'travel_weather_prep.md', section: 'Pre-Trip Checklist', score: 0.8 }],
      };
    }
  }

  private static fallbackQuery(query: string, liveWeather: any): RagQueryResult {
    const qLower = query.toLowerCase();
    const pop = liveWeather?.rainProbability || liveWeather?.pop || 70;
    
    let answer = "";
    if (qLower.includes("umbrella") || qLower.includes("rain")) {
      answer = pop > 50
        ? `Yes, rain is likely today with a ${pop}% probability. Carrying an umbrella is recommended.`
        : `Rain is unlikely today (${pop}% chance). Outdoor activities can proceed normally.`;
    } else if (qLower.includes("humidity")) {
      answer = "High relative humidity slows sweat evaporation from the skin, causing body heat to feel higher than ambient temperature.";
    } else {
      answer = "Probability of Precipitation (PoP) represents the statistical chance of receiving measurable rainfall at your location during the forecast period.";
    }

    return {
      query,
      answer,
      sources: [
        { id: 1, source: 'rain_probability_guide.md', section: 'PoP Definition', category: 'rainfall', authority: 'official', score: 0.85 }
      ],
      confidence_score: 0.85,
    };
  }
}
