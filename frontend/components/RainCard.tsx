import React, { useState } from 'react';
import { CloudRain, Cloud, Umbrella, Sparkles, HelpCircle } from 'lucide-react';
import { CurrentWeather, UnitSystem } from '../types/weather';
import { formatRain } from '../lib/utils';
import { WeatherExplanationModal } from './WeatherExplanationModal';

interface RainCardProps {
  current: CurrentWeather;
  unit: UnitSystem;
}

export const RainCard: React.FC<RainCardProps> = ({ current, unit }) => {
  const [explainMetricKey, setExplainMetricKey] = useState<string | null>(null);
  const [explainValue, setExplainValue] = useState<any>(null);

  const rainProb = current.rainProbability ?? 0;
  const rainfall = current.rainfall ?? 0;

  let intensityMessage = 'No Rain Expected';
  if (rainProb > 0 && rainProb < 30) intensityMessage = 'Low Chance of Light Showers';
  else if (rainProb >= 30 && rainProb < 60) intensityMessage = 'Moderate Chance of Rain';
  else if (rainProb >= 60 && rainProb < 80) intensityMessage = 'High Chance of Rain';
  else if (rainProb >= 80) intensityMessage = 'Heavy Rain Expected';

  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between">
      {/* Background Accent */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Rainfall & Precipitation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{intensityMessage}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setExplainMetricKey('Rain Probability');
              setExplainValue(`${rainProb}%`);
            }}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center gap-1 transition-all"
          >
            <HelpCircle className="w-3 h-3" /> Explain {rainProb}%
          </button>
        </div>

        {/* Rain Probability Bar */}
        <div className="my-4">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
            <span>Rain Probability</span>
            <span>{rainProb}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, rainProb))}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div
            onClick={() => {
              setExplainMetricKey('Rainfall');
              setExplainValue(formatRain(rainfall, unit));
            }}
            className="p-3 rounded-2xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/10 hover:border-sky-500/30 flex items-center gap-3 cursor-pointer transition-all"
          >
            <Umbrella className="w-6 h-6 text-sky-500" />
            <div>
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                Precipitation <HelpCircle className="w-2.5 h-2.5 text-sky-400" />
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {formatRain(rainfall, unit)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/10 flex items-center gap-3">
            <Cloud className="w-6 h-6 text-indigo-400" />
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">Cloud Cover</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{current.cloudCover}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>Real-time precipitation calculation via Open-Meteo</span>
      </div>

      <WeatherExplanationModal
        isOpen={!!explainMetricKey}
        onClose={() => setExplainMetricKey(null)}
        metric={explainMetricKey || ''}
        value={explainValue}
        metricTitle={explainMetricKey || ''}
      />
    </div>
  );
};
