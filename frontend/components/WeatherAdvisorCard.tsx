import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Sun, Umbrella, Wind, Activity, Loader2, Sparkles } from 'lucide-react';
import { getWeatherAdvice } from '../services/api';
import { RAGSourcePanel, SourceItem } from './RAGSourcePanel';

interface WeatherAdvisorCardProps {
  locationName: string;
  currentWeather: any;
}

export const WeatherAdvisorCard: React.FC<WeatherAdvisorCardProps> = ({
  locationName,
  currentWeather,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("Is it a good time to go outside?");
  const [loading, setLoading] = useState<boolean>(false);
  const [adviceData, setAdviceData] = useState<any>(null);

  const advisorQuestions = [
    "Is it a good time to go outside?",
    "Should I carry an umbrella?",
    "Is it too hot for outdoor activity?",
    "Do I need protection from UV?",
    "Is the air quality suitable for outdoor activity?",
  ];

  const fetchAdvice = async (qStr: string) => {
    if (!currentWeather) return;
    setLoading(true);
    try {
      const res = await getWeatherAdvice(locationName, currentWeather, qStr);
      setAdviceData(res);
    } catch (err) {
      setAdviceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice(selectedQuestion);
  }, [locationName, currentWeather, selectedQuestion]);

  if (!currentWeather) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl backdrop-blur-xl mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Personalized Weather Advisor
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                UseCase 3
              </span>
            </h3>
            <p className="text-xs text-slate-400">Contextual advice combining location, live facts & RAG thresholds</p>
          </div>
        </div>
      </div>

      {/* Preset Question Selector Pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {advisorQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedQuestion(q)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all text-left ${
              selectedQuestion === q
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Advice Card Content */}
      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs text-slate-400">Evaluating weather facts & safety thresholds...</span>
        </div>
      ) : adviceData ? (
        <div className="space-y-4">
          {/* Live Weather Fact Header vs RAG Guidance */}
          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm leading-relaxed text-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" /> Personalized Weather Guidance for {locationName}
            </div>
            <div className="whitespace-pre-line">{adviceData.advice}</div>
          </div>

          {/* Citations */}
          <RAGSourcePanel sources={adviceData.sources || []} />
        </div>
      ) : null}
    </div>
  );
};
