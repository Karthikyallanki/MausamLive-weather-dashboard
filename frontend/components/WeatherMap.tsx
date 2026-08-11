'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map, Layers, CloudRain, Thermometer, Wind, Cloud, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { LocationResult } from '../types/weather';

interface WeatherMapProps {
  location: LocationResult;
  onSelectLocation: (loc: LocationResult) => void;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ location, onSelectLocation }) => {
  const [activeLayer, setActiveLayer] = useState<'temp' | 'rain' | 'wind' | 'clouds'>('rain');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    // Dynamic Leaflet Injection
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet Script
    const loadLeafletScript = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).L) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    loadLeafletScript().then(() => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [location.latitude, location.longitude],
          zoom: 7,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        // Click marker inspect event
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          onSelectLocation({
            name: `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
            country: '',
            latitude: lat,
            longitude: lng,
            timezone: 'UTC',
          });
        });

        leafletMapRef.current = map;
      } else {
        leafletMapRef.current.setView([location.latitude, location.longitude], 7);
      }

      // Add location marker
      if (leafletMapRef.current._marker) {
        leafletMapRef.current.removeLayer(leafletMapRef.current._marker);
      }

      const marker = L.marker([location.latitude, location.longitude])
        .addTo(leafletMapRef.current)
        .bindPopup(`<b>${location.name}</b><br/>${location.country}`)
        .openPopup();

      leafletMapRef.current._marker = marker;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [location]);

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Interactive Weather Map</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Worldwide interactive map with temperature, precipitation, wind & cloud cover views
            </p>
          </div>
        </div>

        {/* Map Layer Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveLayer('rain')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeLayer === 'rain'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Rain
          </button>

          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeLayer === 'temp'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Temp
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeLayer === 'wind'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> Wind
          </button>

          <button
            onClick={() => setActiveLayer('clouds')}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeLayer === 'clouds'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> Clouds
          </button>
        </div>
      </div>

      {/* Map Display Box */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 glass-card rounded-2xl p-3 border border-slate-200/50 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-lg">
          <MapPin className="w-4 h-4 text-sky-500" />
          <span>Click anywhere on the map to inspect weather for that location</span>
        </div>
      </div>
    </div>
  );
};
