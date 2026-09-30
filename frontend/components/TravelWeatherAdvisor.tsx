import React, { useState, useEffect } from 'react';
import { Plane, Luggage, Sparkles, Loader2, Calendar } from 'lucide-react';
import { getTravelWeatherAdvice } from '../services/api';
import { RAGSourcePanel, SourceItem } from './RAGSourcePanel';

interface TravelWeatherAdvisorProps {
  destination: string;
  travelDate?: string;
  destinationWeather: any;
}

export const TravelWeatherAdvisor: React.FC<TravelWeatherAdvisorProps> = ({
  destination,
  travelDate = 'Upcoming Trip Date',
  destinationWeather,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [adviceData, setAdviceData] = useState<{ preparation_advice: string; sources: SourceItem[] } | null>(null);

  useEffect(() => {
    if (!destination || !destinationWeather) return;

    const fetchTravelAdvice = async () => {
      setLoading(true);
      try {
        const question = `What should I pack and prepare for my travel to ${destination} with forecast temperature ${destinationWeather.temperature}°C and rain probability ${destinationWeather.rain_probability}%?`;
        const res = await getTravelWeatherAdvice(destination, destinationWeather, question);
        setAdviceData(res);
      } catch (err) {
        setAdviceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelAdvice();
  }, [destination, destinationWeather]);

  if (!destinationWeather) return null;

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg mt-5">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/70">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md">
          <Luggage className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            RAG Travel Weather Advisor
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              UseCase 5
            </span>
          </h4>
          <p className="text-xs text-slate-400">Destination: {destination} ({travelDate})</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
          <span className="text-xs text-slate-400">Synthesizing destination climate guidance...</span>
        </div>
      ) : adviceData ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
            {adviceData.preparation_advice}
          </div>

          <RAGSourcePanel sources={adviceData.sources || []} />
        </div>
      ) : null}
    </div>
  );
};
