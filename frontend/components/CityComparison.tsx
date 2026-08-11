'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Search, X, Plus, Loader2, Thermometer, Droplets, Wind, Sun, ShieldAlert } from 'lucide-react';
import { LocationResult, FullWeatherData, UnitSystem } from '../types/weather';
import { fetchWeather, searchLocations } from '../services/api';
import { celsiusToFahrenheit, kmhToMph, mmToInches } from '../lib/utils';

interface CityComparisonProps {
  currentLocation: LocationResult;
  unit: UnitSystem;
}

const DEFAULT_COMPARE_CITIES: LocationResult[] = [
  { name: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
];

export const CityComparison: React.FC<CityComparisonProps> = ({ currentLocation, unit }) => {
  const [selectedCities, setSelectedCities] = useState<LocationResult[]>([
    currentLocation,
    DEFAULT_COMPARE_CITIES[1],
    DEFAULT_COMPARE_CITIES[2],
  ]);
  const [weatherMap, setWeatherMap] = useState<Record<string, FullWeatherData>>({});
  const [loadingCities, setLoadingCities] = useState<Record<string, boolean>>({});

  // Add City Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    selectedCities.forEach((city) => {
      const cityKey = `${city.latitude}_${city.longitude}`;
      if (!weatherMap[cityKey] && !loadingCities[cityKey]) {
        setLoadingCities((prev) => ({ ...prev, [cityKey]: true }));
        fetchWeather(city.latitude, city.longitude, city.name)
          .then((data) => {
            setWeatherMap((prev) => ({ ...prev, [cityKey]: data }));
          })
          .catch(console.error)
          .finally(() => {
            setLoadingCities((prev) => ({ ...prev, [cityKey]: false }));
          });
      }
    });
  }, [selectedCities]);

  // Search input handler
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddCity = (city: LocationResult) => {
    if (selectedCities.length >= 4) return;
    if (selectedCities.some((c) => c.latitude === city.latitude && c.longitude === city.longitude)) return;
    setSelectedCities([...selectedCities, city]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveCity = (index: number) => {
    if (selectedCities.length <= 2) return;
    const newCities = [...selectedCities];
    newCities.splice(index, 1);
    setSelectedCities(newCities);
  };

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">City Weather Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare 2 to 4 worldwide locations side-by-side using real weather data
            </p>
          </div>
        </div>

        {/* Add City Search Bar */}
        {selectedCities.length < 4 && (
          <div className="relative w-full sm:w-64">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-card border border-slate-300 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Add city to compare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none w-full text-slate-800 dark:text-slate-200"
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin text-sky-500" />}
            </div>

            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 glass-card rounded-2xl p-2 shadow-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddCity(res)}
                    className="w-full text-left p-2 rounded-xl text-xs font-semibold hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-between transition"
                  >
                    <span>{res.name}, {res.country}</span>
                    <Plus className="w-3.5 h-3.5 text-sky-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[600px]">
          {selectedCities.map((city, idx) => {
            const cityKey = `${city.latitude}_${city.longitude}`;
            const data = weatherMap[cityKey];
            const isLoading = loadingCities[cityKey];
            const curr = data?.current;

            const temp = curr
              ? unit === 'imperial'
                ? `${celsiusToFahrenheit(curr.temperature)}°F`
                : `${curr.temperature}°C`
              : 'N/A';

            const feelsLike = curr
              ? unit === 'imperial'
                ? `${celsiusToFahrenheit(curr.feelsLike)}°F`
                : `${curr.feelsLike}°C`
              : 'N/A';

            const wind = curr
              ? unit === 'imperial'
                ? `${kmhToMph(curr.windSpeed)} mph`
                : `${curr.windSpeed} km/h`
              : 'N/A';

            const precip = curr
              ? unit === 'imperial'
                ? `${mmToInches(curr.rainfall)} in`
                : `${curr.rainfall} mm`
              : '0 mm';

            return (
              <div
                key={idx}
                className="relative glass-card rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 space-y-4 shadow-lg hover:shadow-2xl transition"
              >
                {/* Remove button */}
                {selectedCities.length > 2 && (
                  <button
                    onClick={() => handleRemoveCity(idx)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* City Title */}
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">{city.name}</h4>
                  <p className="text-xs font-semibold text-slate-400">{city.country}</p>
                </div>

                {isLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                  </div>
                ) : curr ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                    {/* Condition */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{curr.icon}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{curr.condition}</span>
                    </div>

                    {/* Temp & Feels Like */}
                    <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-sky-500" /> Temperature
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">{temp}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-400">Feels Like</span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">{feelsLike}</span>
                      </div>
                    </div>

                    {/* Metrics List */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl glass-card">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-500" /> Rain Prob.
                        </span>
                        <span className="font-bold text-sky-500">{curr.rainProbability}%</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl glass-card">
                        <span className="font-semibold text-slate-500">Precipitation</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{precip}</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl glass-card">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Wind className="w-3.5 h-3.5 text-indigo-500" /> Wind
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{wind}</span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl glass-card">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> UV Index
                        </span>
                        <span className="font-bold text-amber-500">{curr.uvIndex}</span>
                      </div>

                      {data.airQuality && (
                        <div className="flex items-center justify-between p-2 rounded-xl glass-card">
                          <span className="font-semibold text-slate-500 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Air Quality
                          </span>
                          <span className="font-bold text-emerald-500">{data.airQuality.aqiStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-red-500 font-semibold">Data unavailable.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
