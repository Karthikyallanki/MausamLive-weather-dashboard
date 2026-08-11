'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { WeatherAlert } from '../types/weather';

interface AlertsPanelProps {
  alerts: WeatherAlert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        let borderBg = 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200';
        if (alert.severity === 'danger') {
          borderBg = 'border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200';
        }

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${borderBg} flex items-start gap-3 shadow-md animate-pulse-slow`}
          >
            <div className="p-2 rounded-xl bg-white/20 dark:bg-black/20 flex-none mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold tracking-tight">{alert.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{alert.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
