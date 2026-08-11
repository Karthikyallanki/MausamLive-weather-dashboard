'use client';

import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  Snowflake,
  CloudLightning,
  MapPin,
  Clock,
  RefreshCw,
  Droplets,
  Wind,
  Gauge,
} from 'lucide-react';
import { CurrentWeather as CurrentWeatherType, UnitSystem } from '../types/weather';
import { formatTemp, formatWind, formatTime, formatDate } from '../lib/utils';

interface CurrentWeatherProps {
  current: CurrentWeatherType;
  locationName: string;
  country?: string;
  unit: UnitSystem;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  tempMax?: number;
  tempMin?: number;
}

export const renderWeatherIcon = (iconName: string, className: string = 'w-16 h-16') => {
  switch (iconName) {
    case 'Sun':
      return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
    case 'SunMedium':
      return <SunMedium className={`${className} text-amber-300`} />;
    case 'CloudSun':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'Cloud':
      return <Cloud className={`${className} text-sky-300`} />;
    case 'CloudFog':
      return <CloudFog className={`${className} text-slate-300`} />;
    case 'CloudDrizzle':
      return <CloudDrizzle className={`${className} text-sky-400`} />;
    case 'CloudRain':
      return <CloudRain className={`${className} text-blue-400`} />;
    case 'CloudRainWind':
      return <CloudRainWind className={`${className} text-blue-500`} />;
    case 'Snowflake':
      return <Snowflake className={`${className} text-indigo-200 animate-pulse`} />;
    case 'CloudLightning':
      return <CloudLightning className={`${className} text-amber-500 animate-bounce`} />;
    default:
      return <Cloud className={`${className} text-sky-400`} />;
  }
};

export const CurrentWeatherCard: React.FC<CurrentWeatherProps> = ({
  current,
  locationName,
  country,
  unit,
  lastUpdated,
  onRefresh,
  isRefreshing,
  tempMax,
  tempMin,
}) => {
  return (
    <div className="relative overflow-hidden glass-card rounded-3xl p-6 lg:p-8 shadow-xl transition-all">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header: Location + Refresh Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-500" />
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {locationName}
            </h2>
            {country && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                {country}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Local Time: {formatTime(new Date().toISOString(), current.timezone)}</span>
            <span>•</span>
            <span>{formatDate(new Date().toISOString(), current.timezone)}</span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-full glass-card hover:bg-sky-500/10 text-slate-600 dark:text-slate-300 transition disabled:opacity-50"
          title="Refresh Weather Data"
        >
          <RefreshCw className={`w-4 h-4 text-sky-500 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Temperature & Condition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 my-4">
        {/* Left: Weather Icon & Temperature */}
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-sky-500/10 dark:bg-sky-950/40 border border-sky-500/20">
            {renderWeatherIcon(current.icon, 'w-20 h-20 lg:w-24 lg:h-24')}
          </div>
          <div>
            <div className="flex items-baseline">
              <span className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                {formatTemp(current.temperature, unit)}
              </span>
            </div>
            <div className="text-lg font-bold text-sky-600 dark:text-sky-400 capitalize mt-1">
              {current.condition}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Feels like <span className="font-semibold">{formatTemp(current.feelsLike, unit)}</span>
              {tempMax !== undefined && tempMin !== undefined && (
                <span className="ml-2 font-semibold text-slate-700 dark:text-slate-300">
                  H: {formatTemp(tempMax, unit)} • L: {formatTemp(tempMin, unit)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Weather Metrics */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-800">
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <Droplets className="w-5 h-5 text-blue-500 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Humidity</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{current.humidity}%</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 text-center border-x border-slate-200 dark:border-slate-800">
            <Wind className="w-5 h-5 text-sky-500 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Wind</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatWind(current.windSpeed, unit)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-2 text-center">
            <Gauge className="w-5 h-5 text-indigo-500 mb-1" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pressure</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{current.pressure} hPa</span>
          </div>
        </div>
      </div>

      {/* Footer: Last Updated */}
      <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Source: Open-Meteo Weather API</span>
        <span>
          Updated: {lastUpdated ? formatTime(lastUpdated, current.timezone) : 'Just now'}
        </span>
      </div>
    </div>
  );
};
