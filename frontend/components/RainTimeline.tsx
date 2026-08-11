'use client';

import React from 'react';
import { CloudRain, CloudDrizzle, CloudLightning, Sun, Droplets, Clock } from 'lucide-react';
import { HourlyForecastItem, UnitSystem } from '../types/weather';
import { formatTime, mmToInches } from '../lib/utils';

interface RainTimelineProps {
  hourly: HourlyForecastItem[];
  unit: UnitSystem;
  timezone: string;
}

export const RainTimeline: React.FC<RainTimelineProps> = ({ hourly, unit, timezone }) => {
  if (!hourly || hourly.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-800 text-center">
        <p className="text-xs font-semibold text-slate-500">Rain timeline unavailable.</p>
      </div>
    );
  }

  // Filter next 12-24 hours
  const hours = hourly.slice(0, 12);

  // Identify rain metrics
  const rainHours = hours.filter((h) => h.precipitation > 0 || h.rainProbability > 15);
  const hasRain = rainHours.length > 0;

  const startHour = hasRain ? formatTime(rainHours[0].time, timezone) : null;
  const endHour = hasRain ? formatTime(rainHours[rainHours.length - 1].time, timezone) : null;

  // Peak rain calculation
  let peakItem: HourlyForecastItem | null = null;
  if (hasRain) {
    peakItem = rainHours.reduce((max, curr) =>
      curr.precipitation > max.precipitation ? curr : max
    );
  }

  const getRainIntensity = (precip: number, prob: number) => {
    if (precip === 0 && prob < 15) return { label: 'No rain', color: 'bg-slate-200/50 dark:bg-slate-800 text-slate-400', icon: Sun };
    if (precip <= 1.0 || prob < 40) return { label: 'Light rain', color: 'bg-sky-400/20 text-sky-500 border-sky-400/40', icon: CloudDrizzle };
    if (precip <= 4.0 || prob < 70) return { label: 'Moderate rain', color: 'bg-blue-500/20 text-blue-500 border-blue-500/40', icon: CloudRain };
    return { label: 'Heavy rain', color: 'bg-indigo-600/30 text-indigo-400 border-indigo-500/60', icon: CloudLightning };
  };

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Rain Timeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next 12-Hour Hourly Rain & Intensity Forecast
            </p>
          </div>
        </div>

        {hasRain && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-600 dark:text-sky-400">
            <Droplets className="w-3.5 h-3.5" />
            <span>Rain Expected</span>
          </div>
        )}
      </div>

      {/* Rain Summary Metrics Banner */}
      {hasRain ? (
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-sky-500/5 border border-sky-500/15">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 block">Rain Start</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              {startHour}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 block">Peak Rain</span>
            <span className="text-sm font-black text-indigo-500 flex items-center gap-1">
              <CloudLightning className="w-3.5 h-3.5" />
              {peakItem ? formatTime(peakItem.time, timezone) : 'N/A'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-400 block">Rain End</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {endHour}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">
          ☀️ Dry weather ahead — No rain forecasted for the next 12 hours.
        </div>
      )}

      {/* Hourly Timeline Visual Progression */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {hours.map((item, idx) => {
          const formattedTime = formatTime(item.time, timezone);
          const intensity = getRainIntensity(item.precipitation, item.rainProbability);
          const Icon = intensity.icon;
          const precipDisplay =
            unit === 'imperial'
              ? `${mmToInches(item.precipitation)} in`
              : `${item.precipitation.toFixed(1)} mm`;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl glass-card hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800/80 transition"
            >
              <div className="flex items-center gap-3 w-28">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                  {formattedTime}
                </span>
              </div>

              {/* Rain Intensity Badge */}
              <div className="flex items-center gap-2 flex-1 justify-center">
                <div
                  className={`px-3 py-1 rounded-full border text-[11px] font-extrabold flex items-center gap-1.5 ${intensity.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{intensity.label}</span>
                </div>
              </div>

              {/* Rain Probability & Volume */}
              <div className="flex items-center justify-end gap-3 w-32 text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-sky-500">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{item.rainProbability}%</span>
                </div>
                <span className="text-xs font-medium text-slate-400 w-14">
                  {item.precipitation > 0 ? precipDisplay : '0 mm'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
