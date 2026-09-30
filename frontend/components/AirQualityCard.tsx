import React, { useState } from 'react';
import { Wind, ShieldAlert, Activity, HelpCircle } from 'lucide-react';
import { AirQualityData } from '../types/weather';
import { WeatherExplanationModal } from './WeatherExplanationModal';

interface AirQualityCardProps {
  airQuality: AirQualityData;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  const [explainMetricKey, setExplainMetricKey] = useState<string | null>(null);
  const [explainValue, setExplainValue] = useState<any>(null);

  const isAvailable = airQuality.aqiStatus !== 'Data unavailable';

  let statusBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  if (airQuality.aqiStatus === 'Moderate') statusBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  if (airQuality.aqiStatus === 'Poor') statusBg = 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
  if (airQuality.aqiStatus === 'Very Poor') statusBg = 'bg-red-500/10 text-red-600 dark:text-red-400';
  if (airQuality.aqiStatus === 'Hazardous') statusBg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';

  return (
    <div className="glass-card rounded-3xl p-6 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Air Quality Index (AQI)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time air pollution metrics</p>
          </div>
        </div>

        <button
          onClick={() => {
            setExplainMetricKey('Air Quality Index');
            setExplainValue(`AQI ${airQuality.aqi} (${airQuality.aqiStatus})`);
          }}
          className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center gap-1 transition-all"
        >
          <HelpCircle className="w-3 h-3" /> Explain AQI
        </button>
      </div>

      {isAvailable ? (
        <div>
          {/* AQI Score */}
          <div className="flex items-baseline justify-between my-3">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white">{airQuality.aqi}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">US AQI Standard</span>
            </div>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${statusBg}`}>
              {airQuality.aqiStatus}
            </span>
          </div>

          {/* Pollutants Breakdown Grid */}
          <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800">
            <div className="text-center p-2 rounded-xl bg-slate-500/5">
              <span className="text-[10px] font-bold text-slate-400 block">PM2.5</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {airQuality.pm25 !== null ? airQuality.pm25 : '-'}
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-500/5">
              <span className="text-[10px] font-bold text-slate-400 block">PM10</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {airQuality.pm10 !== null ? airQuality.pm10 : '-'}
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-500/5">
              <span className="text-[10px] font-bold text-slate-400 block">CO</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {airQuality.co !== null ? airQuality.co : '-'}
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-500/5">
              <span className="text-[10px] font-bold text-slate-400 block">NO2</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {airQuality.no2 !== null ? airQuality.no2 : '-'}
              </span>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-500/5">
              <span className="text-[10px] font-bold text-slate-400 block">O3</span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {airQuality.o3 !== null ? airQuality.o3 : '-'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-6 p-4 rounded-2xl bg-slate-500/5 border border-slate-200/50 dark:border-slate-800 text-center">
          <ShieldAlert className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Air quality data unavailable for this location
          </p>
        </div>
      )}

      <WeatherExplanationModal
        isOpen={!!explainMetricKey}
        onClose={() => setExplainMetricKey(null)}
        metric={explainMetricKey || ''}
        value={explainValue}
        metricTitle={explainMetricKey || ''}
      />
    </div>
  );
};
