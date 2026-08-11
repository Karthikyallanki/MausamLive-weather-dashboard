'use client';

import React from 'react';
import { Sunrise, Sunset, Clock, Compass } from 'lucide-react';
import { CurrentWeather } from '../types/weather';

interface SunTrackerProps {
  current: CurrentWeather;
  timezone: string;
}

export const SunTracker: React.FC<SunTrackerProps> = ({ current, timezone }) => {
  const sunriseTimeStr = current.sunrise ? current.sunrise.split('T')[1] || current.sunrise : '06:00';
  const sunsetTimeStr = current.sunset ? current.sunset.split('T')[1] || current.sunset : '18:30';

  // Calculate countdowns
  const calculateCountdown = (targetTimeStr: string) => {
    try {
      const now = new Date();
      const [h, m] = targetTimeStr.split(':').map(Number);
      const target = new Date();
      target.setHours(h || 6, m || 0, 0, 0);

      if (target.getTime() < now.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `In ${diffHours}h ${diffMins}m`;
    } catch {
      return 'N/A';
    }
  };

  const sunriseCountdown = calculateCountdown(sunriseTimeStr);
  const sunsetCountdown = calculateCountdown(sunsetTimeStr);

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Sun Tracker & Countdown</h4>
          <p className="text-[11px] text-slate-400">Sunrise and sunset relative to location timezone</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Sunrise Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Sunrise className="w-5 h-5" />
            <span className="text-xs font-black">Sunrise</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">{sunriseTimeStr}</div>
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {sunriseCountdown}
          </div>
        </div>

        {/* Sunset Box */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
          <div className="flex items-center gap-2 text-indigo-500">
            <Sunset className="w-5 h-5" />
            <span className="text-xs font-black">Sunset</span>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white">{sunsetTimeStr}</div>
          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {sunsetCountdown}
          </div>
        </div>
      </div>
    </div>
  );
};
