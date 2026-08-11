'use client';

import React from 'react';
import { Smile, Thermometer, Droplets, Wind, Info } from 'lucide-react';
import { CurrentWeather, UnitSystem } from '../types/weather';
import { celsiusToFahrenheit, kmhToMph } from '../lib/utils';

interface ComfortIndexCardProps {
  current: CurrentWeather;
  unit: UnitSystem;
}

export const ComfortIndexCard: React.FC<ComfortIndexCardProps> = ({ current, unit }) => {
  const temp = current.temperature;
  const humidity = current.humidity;
  const wind = current.windSpeed;

  const calculateComfort = (t: number, h: number, w: number) => {
    if (t < 12) return { level: 'Cold', color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' };
    if (t > 38) return { level: 'Very Hot', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    if (t > 32) return { level: 'Hot', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (t > 26 && h > 70) return { level: 'Humid', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
    if (t > 25) return { level: 'Warm', color: 'text-amber-600 bg-amber-600/10 border-amber-600/20' };
    if (t >= 18 && h <= 65) return { level: 'Very Comfortable', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    return { level: 'Comfortable', color: 'text-emerald-600 bg-emerald-600/10 border-emerald-600/20' };
  };

  const comfort = calculateComfort(temp, humidity, wind);

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Smile className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Weather Comfort Index</h4>
          <p className="text-[11px] text-slate-400">Outdoor thermal comfort classification</p>
        </div>
      </div>

      {/* Comfort Level Badge */}
      <div className={`p-4 rounded-2xl border text-center space-y-1 ${comfort.color}`}>
        <span className="text-xs font-bold uppercase tracking-wider block">Comfort Level</span>
        <span className="text-xl font-black">{comfort.level}</span>
      </div>

      {/* Factors Used */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 rounded-xl glass-card text-center">
          <span className="text-[10px] font-semibold text-slate-400 block">Temperature</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {unit === 'imperial' ? `${celsiusToFahrenheit(temp)}°F` : `${temp}°C`}
          </span>
        </div>

        <div className="p-2 rounded-xl glass-card text-center">
          <span className="text-[10px] font-semibold text-slate-400 block">Humidity</span>
          <span className="font-bold text-sky-500">{humidity}%</span>
        </div>

        <div className="p-2 rounded-xl glass-card text-center">
          <span className="text-[10px] font-semibold text-slate-400 block">Wind</span>
          <span className="font-bold text-indigo-500">
            {unit === 'imperial' ? `${kmhToMph(wind)} mph` : `${wind} km/h`}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
        <Info className="w-3 h-3 text-slate-400 flex-none" />
        Calculated using standard heat index formulas. Not intended for medical advice.
      </p>
    </div>
  );
};
