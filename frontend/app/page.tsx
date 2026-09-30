'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '../components/Header';
import { CurrentWeatherCard } from '../components/CurrentWeather';
import { RainCard } from '../components/RainCard';
import { RainSoonCard } from '../components/RainSoonCard';
import { DailyForecast } from '../components/DailyForecast';
import { WeatherDetails } from '../components/WeatherDetails';
import { AirQualityCard } from '../components/AirQualityCard';
import { AlertsPanel } from '../components/AlertsPanel';
import { NotificationModal } from '../components/NotificationModal';
import { ReportCenterModal } from '../components/ReportCenterModal';
import { ReportHistoryDrawer } from '../components/ReportHistoryDrawer';
import { OfflineBanner } from '../components/OfflineBanner';
import { LocationResult, FullWeatherData, UnitSystem } from '../types/weather';
import { fetchWeather } from '../services/api';
import { Loader2, Globe, AlertCircle, Sparkles } from 'lucide-react';

import { RainTimeline } from '../components/RainTimeline';
import { CityComparison } from '../components/CityComparison';
import { WeatherMap } from '../components/WeatherMap';
import { SmartSummary } from '../components/SmartSummary';
import { PersonalAlertRules } from '../components/PersonalAlertRules';
import { WeatherShareCard } from '../components/WeatherShareCard';
import { SunTracker } from '../components/SunTracker';
import { ComfortIndexCard } from '../components/ComfortIndexCard';
import { DataQualityPanel } from '../components/DataQualityPanel';
import { TravelWeatherModal } from '../components/TravelWeatherModal';
import { AskWeatherAssistant } from '../components/AskWeatherAssistant';
import { WeatherAdvisorCard } from '../components/WeatherAdvisorCard';

const HourlyForecast = dynamic(
  () => import('../components/HourlyForecast').then((mod) => mod.HourlyForecast),
  { ssr: false }
);

const DEFAULT_LOCATION: LocationResult = {
  name: 'Visakhapatnam',
  country: 'India',
  state: 'Andhra Pradesh',
  latitude: 17.68009,
  longitude: 83.20161,
  timezone: 'Asia/Kolkata',
};

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult>(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals & Drawers State
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isReportCenterOpen, setIsReportCenterOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState<boolean>(false);
  const [isAskAssistantOpen, setIsAskAssistantOpen] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadWeather = useCallback(async (loc: LocationResult, showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const data = await fetchWeather(loc.latitude, loc.longitude, loc.name);
      setWeatherData(data);
    } catch (err: any) {
      setError(err?.message || 'Weather data temporarily unavailable');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWeather(selectedLocation, true);
  }, [selectedLocation, loadWeather]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedLocation) {
        loadWeather(selectedLocation, false);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedLocation, loadWeather]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const myLocation: LocationResult = {
          name: 'Current Location',
          country: '',
          latitude,
          longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
        setSelectedLocation(myLocation);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setError('Location permission denied. Please search for a city.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Offline Status Bar */}
      <OfflineBanner />

      {/* Header */}
      <Header
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onUseMyLocation={handleUseMyLocation}
        isLocating={isLocating}
        unit={unit}
        onToggleUnit={() => setUnit((prev) => (prev === 'metric' ? 'imperial' : 'metric'))}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((prev) => !prev)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenReportCenter={() => setIsReportCenterOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenTravelMode={() => setIsTravelModalOpen(true)}
        onOpenAskAssistant={() => setIsAskAssistantOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {/* Ask MausamLive RAG Weather Assistant Widget */}
        <AskWeatherAssistant
          currentLocationName={selectedLocation.name}
          liveWeatherData={weatherData?.current}
        />

        {/* Personalized Weather Advisor (Use Case 3) */}
        {weatherData && (
          <WeatherAdvisorCard
            locationName={selectedLocation.name}
            currentWeather={weatherData.current}
          />
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative">
              <Globe className="w-16 h-16 text-sky-500 animate-spin" />
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin absolute inset-0 m-auto" />
            </div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Fetching real live weather for {selectedLocation.name}...
            </p>
          </div>
        ) : weatherData ? (
          <>
            {/* Active Severe Weather Alerts */}
            <AlertsPanel alerts={weatherData.alerts} />

            {/* Top Grid: Hero Card + Rain Card + Rain Soon Predictor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CurrentWeatherCard
                  current={weatherData.current}
                  locationName={selectedLocation.name}
                  country={selectedLocation.country}
                  unit={unit}
                  lastUpdated={weatherData.lastUpdated}
                  onRefresh={() => loadWeather(selectedLocation, false)}
                  isRefreshing={isRefreshing}
                  tempMax={weatherData.daily[0]?.tempMax}
                  tempMin={weatherData.daily[0]?.tempMin}
                />
                <SmartSummary weatherData={weatherData} unit={unit} />
              </div>

              <div className="space-y-6">
                <RainCard current={weatherData.current} unit={unit} />
                <RainSoonCard
                  hourly={weatherData.hourly}
                  unit={unit}
                  timezone={weatherData.location.timezone}
                />
              </div>
            </div>

            {/* 24-Hour Hourly Forecast Chart & Slider */}
            <HourlyForecast
              hourly={weatherData.hourly}
              unit={unit}
              timezone={weatherData.location.timezone}
            />

            {/* Rain Timeline Component (Phase 1) */}
            <RainTimeline
              hourly={weatherData.hourly}
              unit={unit}
              timezone={weatherData.location.timezone}
            />

            {/* City Comparison Component (Phase 2) */}
            <CityComparison
              currentLocation={selectedLocation}
              unit={unit}
            />

            {/* Interactive Weather Map Component (Phase 3) */}
            <WeatherMap
              location={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
            />

            {/* Personal Alert Rules Component (Phase 5) */}
            <PersonalAlertRules
              currentLocation={selectedLocation}
            />

            {/* Middle Grid: 7-Day Forecast + AQI + Weather Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DailyForecast daily={weatherData.daily} unit={unit} />
              </div>

              <div className="space-y-6">
                <AirQualityCard airQuality={weatherData.airQuality} />
                <WeatherDetails current={weatherData.current} unit={unit} />
                <SunTracker current={weatherData.current} timezone={weatherData.location.timezone} />
                <ComfortIndexCard current={weatherData.current} unit={unit} />
                <WeatherShareCard weatherData={weatherData} unit={unit} />
              </div>
            </div>

            {/* System Health & Telemetry Export Panel (Phase 14 & 19) */}
            <DataQualityPanel weatherData={weatherData} unit={unit} />

            {/* Data Source Quality Banner */}
            <div className="p-4 rounded-2xl glass-card border border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>
                  Source: <strong>Open-Meteo Weather API</strong> | Model: <strong>Best Match</strong>
                </span>
              </div>
              <span className="hidden sm:inline">
                Real-time weather data and forecasts from configured weather provider.
              </span>
            </div>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="glass-header py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold">MausamLive 🌍 — Enterprise Real-Time Weather Application</p>
          <p>Powered by Open-Meteo Weather Service, Twilio & Next.js</p>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentLocationName={selectedLocation.name}
        lat={selectedLocation.latitude}
        lon={selectedLocation.longitude}
      />

      <ReportCenterModal
        isOpen={isReportCenterOpen}
        onClose={() => setIsReportCenterOpen(false)}
        location={selectedLocation}
      />

      <ReportHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
      />

      <TravelWeatherModal
        isOpen={isTravelModalOpen}
        onClose={() => setIsTravelModalOpen(false)}
        unit={unit}
      />
    </div>
  );
}
