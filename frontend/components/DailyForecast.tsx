'use client';

import React from 'react';
import { Calendar, CloudRain } from 'lucide-react';
import { DailyForecastItem, UnitSystem } from '../types/weather';
import { renderWeatherIcon } from './CurrentWeather';
import { formatTemp, celsiusToFahrenheit } from '../lib/utils';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: UnitSystem;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  if (!daily || daily.length === 0) return null;

  // Find min and max temperature across all days for scale bar
  const allMaxs = daily.map((d) => d.tempMax);
  const allMins = daily.map((d) => d.tempMin);
  const minTempGlobal = Math.min(...allMins);
  const maxTempGlobal = Math.max(...allMaxs);
  const tempRangeGlobal = Math.max(1, maxTempGlobal - minTempGlobal);

  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">7-Day Daily Forecast</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weekly weather trends & rain probability</p>
        </div>
      </div>

      <div className="space-y-3">
        {daily.map((day, idx) => {
          const leftPercent = ((day.tempMin - minTempGlobal) / tempRangeGlobal) * 100;
          const widthPercent = ((day.tempMax - day.tempMin) / tempRangeGlobal) * 100;

          return (
            <div
              key={`${day.date}-${idx}`}
              className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-800/80 hover:bg-sky-500/5 transition"
            >
              {/* Day & Date */}
              <div className="w-24">
                <span className="text-sm font-bold text-slate-900 dark:text-white block">{day.dayName}</span>
                <span className="text-[11px] text-slate-400 font-medium">{day.date}</span>
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2 w-36">
                {renderWeatherIcon(day.condition, 'w-6 h-6')}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {day.condition}
                </span>
              </div>

              {/* Rain Probability */}
              <div className="flex items-center gap-1 w-20 text-xs font-bold text-blue-500">
                <CloudRain className="w-3.5 h-3.5" />
                <span>{day.rainProbability}%</span>
              </div>

              {/* High / Low Temperature Bar */}
              <div className="flex items-center gap-3 w-40 sm:w-52">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-8 text-right">
                  {formatTemp(day.tempMin, unit)}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(10, widthPercent)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white w-8">
                  {formatTemp(day.tempMax, unit)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
