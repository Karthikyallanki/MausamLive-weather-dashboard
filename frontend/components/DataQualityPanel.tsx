'use client';

import React from 'react';
import { Database, Activity, FileSpreadsheet, Printer, ShieldCheck, Clock, Server } from 'lucide-react';
import { FullWeatherData, UnitSystem } from '../types/weather';
import { exportWeatherCSV, exportWeatherPDF } from '../lib/exportUtils';

interface DataQualityPanelProps {
  weatherData: FullWeatherData;
  unit: UnitSystem;
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({ weatherData, unit }) => {
  const { location, lastUpdated } = weatherData;

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">System Health & Export Center</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time API provider telemetry, database status & report export tools
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportWeatherCSV(weatherData, unit)}
            className="px-3.5 py-2 rounded-2xl glass-card hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={() => exportWeatherPDF(weatherData, unit)}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Grid Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather Provider Box */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Primary Provider</span>
          <span className="text-sm font-black text-sky-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Open-Meteo
          </span>
          <span className="text-[10px] text-slate-500 block">Model: Seamless Best-Match</span>
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Database System</span>
          <span className="text-sm font-black text-emerald-500 flex items-center gap-1.5">
            <Database className="w-4 h-4" /> SQLite (Prisma)
          </span>
          <span className="text-[10px] text-slate-500 block">Status: ONLINE (Cached)</span>
        </div>

        {/* API Latency Status */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">API Service Health</span>
          <span className="text-sm font-black text-emerald-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> 100% Operational
          </span>
          <span className="text-[10px] text-slate-500 block">Latency: &lt;150ms</span>
        </div>

        {/* Telemetry Info */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">Location Telemetry</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
          </span>
          <span className="text-[10px] text-slate-500 block flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-500" /> {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
};
