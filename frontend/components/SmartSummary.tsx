'use client';

import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { FullWeatherData, UnitSystem } from '../types/weather';
import { celsiusToFahrenheit, kmhToMph } from '../lib/utils';

interface SmartSummaryProps {
  weatherData: FullWeatherData;
  unit: UnitSystem;
}

export const SmartSummary: React.FC<SmartSummaryProps> = ({ weatherData, unit }) => {
  const { current, daily, location } = weatherData;

  const tempMax = daily[0]?.tempMax ?? current.temperature;
  const tempMin = daily[0]?.tempMin ?? current.temperature;
  const rainProb = current.rainProbability ?? 0;
  const wind = current.windSpeed ?? 0;
  const condition = current.condition || 'Clear';

  const formatTemp = (celsius: number) =>
    unit === 'imperial' ? `${celsiusToFahrenheit(celsius)}°F` : `${celsius}°C`;

  const formatSpeed = (kmh: number) =>
    unit === 'imperial' ? `${kmhToMph(kmh)} mph` : `${kmh} km/h`;

  // Natural Language Engine
  let tempDescription = 'mild';
  if (tempMax >= 35) tempDescription = 'very hot';
  else if (tempMax >= 30) tempDescription = 'warm';
  else if (tempMax >= 20) tempDescription = 'pleasant';
  else if (tempMax >= 10) tempDescription = 'cool';
  else tempDescription = 'cold';

  let rainSentence = '';
  if (rainProb >= 70) {
    rainSentence = `There is a high ${rainProb}% chance of rain today.`;
  } else if (rainProb >= 30) {
    rainSentence = `There is a moderate ${rainProb}% chance of rain showers.`;
  } else if (rainProb > 0) {
    rainSentence = `Slight chance of rain (${rainProb}%).`;
  } else {
    rainSentence = `No rain is expected today.`;
  }

  let windSentence = '';
  if (wind >= 30) {
    windSentence = `Strong winds reaching ${formatSpeed(wind)}.`;
  } else if (wind >= 15) {
    windSentence = `Moderate breeze at ${formatSpeed(wind)}.`;
  } else {
    windSentence = `Light winds around ${formatSpeed(wind)}.`;
  }

  const fullSummary = `Today in ${location.name} will be ${tempDescription} with a high of ${formatTemp(
    tempMax
  )} and a low of ${formatTemp(tempMin)}. Conditions will be ${condition.toLowerCase()}. ${rainSentence} ${windSentence}`;

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Smart Weather Summary</span>
          </h4>
          <p className="text-[11px] text-slate-400">Natural language forecast engine derived from real live data</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed p-4 rounded-2xl bg-sky-500/5 border border-sky-500/15">
        "{fullSummary}"
      </p>
    </div>
  );
};
