import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UnitSystem } from '../types/weather';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371 * 10) / 10;
}

export function mmToInches(mm: number): number {
  return Math.round(mm * 0.0393701 * 100) / 100;
}

export function formatTemp(celsius: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWind(kmh: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${kmhToMph(kmh)} mph`;
  }
  return `${kmh} km/h`;
}

export function formatRain(mm: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${mmToInches(mm)} in`;
  }
  return `${mm} mm`;
}

export function formatTime(isoString: string, timeZone?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone || undefined,
    });
  } catch (err) {
    return isoString;
  }
}

export function formatDate(isoString: string, timeZone?: string): string {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timeZone || undefined,
    });
  } catch (err) {
    return isoString;
  }
}
