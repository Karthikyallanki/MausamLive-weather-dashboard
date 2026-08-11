'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Bell,
  Sun,
  Moon,
  Thermometer,
  Loader2,
  Globe,
  FileText,
  History,
  Plane,
} from 'lucide-react';
import { LocationResult, UnitSystem } from '../types/weather';
import { searchLocations } from '../services/api';

interface HeaderProps {
  onSelectLocation: (loc: LocationResult) => void;
  onUseMyLocation: () => void;
  isLocating: boolean;
  unit: UnitSystem;
  onToggleUnit: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenReportCenter: () => void;
  onOpenHistory: () => void;
  onOpenTravelMode?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectLocation,
  onUseMyLocation,
  isLocating,
  unit,
  onToggleUnit,
  darkMode,
  onToggleTheme,
  onOpenNotifications,
  onOpenReportCenter,
  onOpenHistory,
  onOpenTravelMode,
  unreadCount = 0,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchLocations(query);
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (loc: LocationResult) => {
    onSelectLocation(loc);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 glass-header px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-sky-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              MausamLive
            </h1>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onOpenReportCenter}
              className="p-2 rounded-full glass-card hover:bg-indigo-500/10 text-indigo-500 transition"
              title="Report Center"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleUnit}
              className="p-2 rounded-full glass-card hover:bg-sky-500/10 text-xs font-bold transition"
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full glass-card hover:bg-sky-500/10 transition"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full glass-card hover:bg-sky-500/10 transition"
            >
              <Bell className="w-4 h-4 text-sky-500" />
            </button>
          </div>
        </div>

        {/* Search Bar + Location Button */}
        <div className="relative w-full md:max-w-md flex items-center gap-2" ref={dropdownRef}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Search city... (e.g. Visakhapatnam, London, Tokyo)"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-full glass-card border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-sky-500" />
            )}
          </div>

          <button
            onClick={onUseMyLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md transition disabled:opacity-50 whitespace-nowrap"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Use My Location</span>
          </button>

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 glass-card rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800">
              {results.map((loc, idx) => (
                <button
                  key={`${loc.name}-${loc.latitude}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-2.5 hover:bg-sky-500/10 flex items-center justify-between text-sm transition"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{loc.name}</span>
                    {loc.state && <span className="text-slate-500 text-xs font-normal">, {loc.state}</span>}
                    <span className="text-slate-500 text-xs font-normal"> ({loc.country})</span>
                  </div>
                  <span className="text-[10px] text-sky-500 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-full">
                    {loc.timezone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Report Center Button */}
          <button
            onClick={onOpenReportCenter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs transition border border-indigo-500/20"
            title="Weather Report Center"
          >
            <FileText className="w-3.5 h-3.5" />
            Report Center
          </button>

          {/* Travel Weather Button */}
          {onOpenTravelMode && (
            <button
              onClick={onOpenTravelMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-extrabold text-xs transition border border-sky-500/20"
              title="Travel Weather Mode"
            >
              <Plane className="w-3.5 h-3.5" />
              Travel Mode
            </button>
          )}

          {/* Delivery History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-700 dark:text-slate-200 transition"
            title="Message Delivery Log"
          >
            <History className="w-4 h-4 text-sky-500" />
          </button>

          {/* Unit Toggle */}
          <button
            onClick={onToggleUnit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full glass-card hover:bg-sky-500/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
          >
            <Thermometer className="w-3.5 h-3.5 text-sky-500" />
            {unit === 'metric' ? '°C' : '°F'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-700 dark:text-slate-200 transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notification Modal Toggle */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-700 dark:text-slate-200 transition"
          >
            <Bell className="w-4 h-4 text-sky-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
