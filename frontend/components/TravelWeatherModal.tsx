'use client';

import React, { useState } from 'react';
import { Plane, Calendar, MapPin, Send, X, Loader2, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';
import { LocationResult, DailyForecastItem, UnitSystem } from '../types/weather';
import { searchLocations, fetchWeather, sendSMSReport, sendWhatsAppReport, triggerTestNotification } from '../services/api';
import { celsiusToFahrenheit, kmhToMph, mmToInches } from '../lib/utils';
import { TravelWeatherAdvisor } from './TravelWeatherAdvisor';

interface TravelWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: UnitSystem;
}

export const TravelWeatherModal: React.FC<TravelWeatherModalProps> = ({ isOpen, onClose, unit }) => {
  const [destinationQuery, setDestinationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<LocationResult | null>(null);
  const [travelDate, setTravelDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [forecastItem, setForecastItem] = useState<DailyForecastItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (val: string) => {
    setDestinationQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchLocations(val);
      setSearchResults(results.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDestination = async (loc: LocationResult) => {
    setSelectedDestination(loc);
    setSearchResults([]);
    setDestinationQuery(loc.name);
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const data = await fetchWeather(loc.latitude, loc.longitude, loc.name);
      // Match travel date with daily forecast array
      const matched = data.daily.find((d) => d.date === travelDate) || data.daily[0];
      setForecastItem(matched);
    } catch (err) {
      setStatusMessage('Forecast not currently available for this date.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTravelReport = async (channel: 'sms' | 'whatsapp' | 'browser') => {
    if (!selectedDestination) return;
    setStatusMessage('Dispatching travel report...');

    try {
      if (channel === 'sms') {
        const res = await sendSMSReport(selectedDestination.name, selectedDestination.latitude, selectedDestination.longitude, '+919441005233');
        setStatusMessage(res.message);
      } else if (channel === 'whatsapp') {
        const res = await sendWhatsAppReport(selectedDestination.name, selectedDestination.latitude, selectedDestination.longitude, '+919441005233', 'Travel Weather Report');
        setStatusMessage(res.message);
      } else {
        await triggerTestNotification();
        setStatusMessage('🔔 Instant Browser Travel Weather Notification sent to desktop!');
      }
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to dispatch travel report.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Travel Weather Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plan trip weather for any destination & dispatch travel reports
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs font-semibold text-sky-600 dark:text-sky-400">
            {statusMessage}
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Destination Search Input */}
          <div className="relative">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Destination City
            </label>
            <input
              type="text"
              value={destinationQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search destination (e.g. Dubai, London, Goa)..."
              className="w-full p-3 rounded-2xl glass-card border border-slate-300 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-sky-500"
            />

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 glass-card rounded-2xl p-2 shadow-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectDestination(res)}
                    className="w-full text-left p-2 rounded-xl hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between transition"
                  >
                    <span>{res.name}, {res.country}</span>
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Travel Date */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full p-3 rounded-2xl glass-card border border-slate-300 dark:border-slate-700 font-semibold"
            />
          </div>

          {/* Forecast Result Card */}
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          ) : forecastItem && selectedDestination ? (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  {selectedDestination.name} ({forecastItem.dayName})
                </span>
                <span className="font-bold text-sky-500">{forecastItem.condition}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl glass-card flex items-center justify-between">
                  <span className="font-semibold text-slate-400">High / Low</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {unit === 'imperial' ? `${celsiusToFahrenheit(forecastItem.tempMax)}°F` : `${forecastItem.tempMax}°C`} / {unit === 'imperial' ? `${celsiusToFahrenheit(forecastItem.tempMin)}°F` : `${forecastItem.tempMin}°C`}
                  </span>
                </div>

                <div className="p-2 rounded-xl glass-card flex items-center justify-between">
                  <span className="font-semibold text-slate-400">Rain Prob.</span>
                  <span className="font-bold text-sky-500">{forecastItem.rainProbability}%</span>
                </div>
              </div>

              {/* Action Buttons to Send Travel Report */}
              <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 space-y-2">
                <span className="block font-bold text-slate-500 text-[11px]">Send Travel Report Via:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSendTravelReport('whatsapp')}
                    className="py-2 rounded-xl bg-emerald-500 text-white font-bold text-[11px] hover:bg-emerald-600 transition"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleSendTravelReport('sms')}
                    className="py-2 rounded-xl bg-sky-500 text-white font-bold text-[11px] hover:bg-sky-600 transition"
                  >
                    SMS
                  </button>
                  <button
                    onClick={() => handleSendTravelReport('browser')}
                    className="py-2 rounded-xl bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-700 transition"
                  >
                    Browser
                  </button>
                </div>
              </div>

              {/* Use Case 5: Travel Weather RAG Advisor */}
              <TravelWeatherAdvisor
                destination={selectedDestination.name}
                travelDate={travelDate}
                destinationWeather={{
                  temperature: forecastItem.tempMax,
                  rain_probability: forecastItem.rainProbability,
                  condition: forecastItem.condition,
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
