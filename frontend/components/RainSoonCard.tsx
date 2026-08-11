'use client';

import React from 'react';
import { CloudRain, Sparkles, Umbrella, Sun, Clock } from 'lucide-react';
import { HourlyForecastItem, UnitSystem } from '../types/weather';
import { formatRain, formatTime } from '../lib/utils';

interface RainSoonCardProps {
  hourly: HourlyForecastItem[];
  unit: UnitSystem;
  timezone?: string;
}

export const RainSoonCard: React.FC<RainSoonCardProps> = ({ hourly, unit, timezone }) => {
  if (!hourly || hourly.length === 0) return null;

  // Inspect the next 3 hours of real forecast data
  const next3Hours = hourly.slice(0, 3);
  const rainItem = next3Hours.find(
    (h) => h.rainProbability >= 50 || h.precipitation >= 0.1
  );

  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between border-l-4 border-l-blue-500">
      {/* Background Subtle Accent */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <CloudRain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">🌧️ Rain Soon</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">1–3 Hour Short-Term Prediction</p>
            </div>
          </div>
          {rainItem ? (
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Rain Expected
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Clear Window
            </span>
          )}
        </div>

        {rainItem ? (
          <div className="space-y-3 my-2">
            <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
              Rain may start soon!
            </p>

            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Expected Start</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatTime(rainItem.time, timezone)}
                </span>
              </div>
              <div className="border-x border-blue-500/10">
                <span className="text-[10px] font-bold text-slate-400 block">Probability</span>
                <span className="text-xs font-extrabold text-blue-500">{rainItem.rainProbability}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">Precipitation</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatRain(rainItem.precipitation, unit)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
            <Sun className="w-6 h-6 text-amber-400 flex-none" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No rain expected in the next 3 hours based on Open-Meteo forecast.
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2.5 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        <span>Scanned from real 3-hour precipitation model</span>
      </div>
    </div>
  );
};
