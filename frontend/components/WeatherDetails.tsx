'use client';

import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  Info,
} from 'lucide-react';
import { CurrentWeather, UnitSystem } from '../types/weather';
import { formatWind, formatTime } from '../lib/utils';

interface WeatherDetailsProps {
  current: CurrentWeather;
  unit: UnitSystem;
}

export const WeatherDetails: React.FC<WeatherDetailsProps> = ({ current, unit }) => {
  let uvCategory = 'Low';
  if (current.uvIndex >= 3 && current.uvIndex < 6) uvCategory = 'Moderate';
  else if (current.uvIndex >= 6 && current.uvIndex < 8) uvCategory = 'High';
  else if (current.uvIndex >= 8 && current.uvIndex < 11) uvCategory = 'Very High';
  else if (current.uvIndex >= 11) uvCategory = 'Extreme';

  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weather Details</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive environmental metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Humidity */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Humidity</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{current.humidity}%</span>
          <span className="text-[11px] text-slate-400 mt-1">
            {current.humidity > 60 ? 'High moisture level' : 'Comfortable moisture'}
          </span>
        </div>

        {/* Wind */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Wind</span>
            <Wind className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {formatWind(current.windSpeed, unit)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Direction: {current.windDirection}°</span>
        </div>

        {/* Pressure */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pressure</span>
            <Gauge className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{current.pressure} hPa</span>
          <span className="text-[11px] text-slate-400 mt-1">Standard atmospheric pressure</span>
        </div>

        {/* Visibility */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Visibility</span>
            <Eye className="w-4 h-4 text-teal-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {unit === 'imperial' ? `${Math.round(current.visibility * 0.621)} mi` : `${current.visibility} km`}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Clear view distance</span>
        </div>

        {/* UV Index */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">UV Index</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{current.uvIndex}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {uvCategory}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {current.uvIndex > 5 ? 'Sun protection required' : 'Minimal protection needed'}
          </span>
        </div>

        {/* Sunrise / Sunset */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Sun Schedule</span>
            <Sunrise className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200">
              <Sunrise className="w-3.5 h-3.5 text-amber-400" />
              <span>Sunrise: <strong className="font-bold">{formatTime(current.sunrise, current.timezone)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200">
              <Sunset className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sunset: <strong className="font-bold">{formatTime(current.sunset, current.timezone)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
