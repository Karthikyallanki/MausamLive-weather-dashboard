'use client';

import React, { useState, useRef } from 'react';
import { Share2, Download, Copy, Check, Sparkles, Globe } from 'lucide-react';
import { FullWeatherData, UnitSystem } from '../types/weather';
import { celsiusToFahrenheit, kmhToMph } from '../lib/utils';

interface WeatherShareCardProps {
  weatherData: FullWeatherData;
  unit: UnitSystem;
}

export const WeatherShareCard: React.FC<WeatherShareCardProps> = ({ weatherData, unit }) => {
  const { current, location, lastUpdated } = weatherData;
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const temp = unit === 'imperial' ? `${celsiusToFahrenheit(current.temperature)}°F` : `${current.temperature}°C`;
  const wind = unit === 'imperial' ? `${kmhToMph(current.windSpeed)} mph` : `${current.windSpeed} km/h`;

  const shareText = `MAUSAMLIVE 🌍\n📍 ${location.name}, ${location.country}\n🌡️ Temp: ${temp} (${current.condition})\n🌧️ Rain Prob: ${current.rainProbability}%\n💧 Humidity: ${current.humidity}%\n💨 Wind: ${wind}\n⏰ Updated: ${lastUpdated}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MausamLive — Weather in ${location.name}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Share Weather Card</h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl glass-card hover:bg-sky-500/10 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-sky-500" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>

          <button
            onClick={handleNativeShare}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Card
          </button>
        </div>
      </div>

      {/* Share Card Content Preview */}
      <div
        ref={cardRef}
        className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3 shadow-xl border border-indigo-500/30"
      >
        <div className="flex items-center justify-between text-xs font-black tracking-widest text-sky-400">
          <span>MAUSAMLIVE 🌍</span>
          <span>{lastUpdated}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black">{location.name}</h3>
            <p className="text-xs font-semibold text-slate-400">{location.country}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-sky-400">{temp}</span>
            <p className="text-xs font-bold text-slate-300">{current.condition}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[11px] font-semibold text-slate-300">
          <div>🌧️ Rain: <strong className="text-white">{current.rainProbability}%</strong></div>
          <div>💧 Humidity: <strong className="text-white">{current.humidity}%</strong></div>
          <div>💨 Wind: <strong className="text-white">{wind}</strong></div>
        </div>
      </div>
    </div>
  );
};
