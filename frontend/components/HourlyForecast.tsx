'use client';

import React, { useState } from 'react';
import { Clock, BarChart2, LayoutGrid, CloudRain } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ComposedChart,
} from 'recharts';
import { HourlyForecastItem, UnitSystem } from '../types/weather';
import { renderWeatherIcon } from './CurrentWeather';
import { formatTemp, celsiusToFahrenheit, formatTime } from '../lib/utils';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: UnitSystem;
  timezone?: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, unit, timezone }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('chart');

  if (!hourly || hourly.length === 0) return null;

  // Prepare chart data
  const chartData = hourly.slice(0, 24).map((item) => {
    const tempValue = unit === 'imperial' ? celsiusToFahrenheit(item.temperature) : item.temperature;
    const timeFormatted = formatTime(item.time, timezone);
    return {
      time: timeFormatted,
      temp: tempValue,
      rainProb: item.rainProbability,
      precipitation: item.precipitation,
      condition: item.condition,
    };
  });

  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">24-Hour Forecast</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hourly weather trend & precipitation</p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-full glass-card border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition ${
              viewMode === 'chart'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Chart
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full transition ${
              viewMode === 'cards'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Cards
          </button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' ? (
        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 glass-card rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">{data.time}</p>
                        <p className="text-sky-500 font-semibold">{data.condition}</p>
                        <p className="text-slate-700 dark:text-slate-300">
                          Temp: <span className="font-bold">{data.temp}°{unit === 'metric' ? 'C' : 'F'}</span>
                        </p>
                        <p className="text-blue-400">
                          Rain Chance: <span className="font-bold">{data.rainProb}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="right" dataKey="rainProb" fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temp"
                stroke="#0ea5e9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Cards Slider View */
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {hourly.slice(0, 24).map((item, idx) => (
            <div
              key={`${item.time}-${idx}`}
              className="flex-none w-28 p-3 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex flex-col items-center justify-between text-center hover:scale-105 transition"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {formatTime(item.time, timezone)}
              </span>
              <div className="my-2">{renderWeatherIcon(item.condition, 'w-8 h-8')}</div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatTemp(item.temperature, unit)}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-500 font-semibold">
                <CloudRain className="w-3 h-3" />
                <span>{item.rainProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
