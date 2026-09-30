import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, HelpCircle } from 'lucide-react';
import { WeatherAlert } from '../types/weather';
import { AlertExplanationModal } from './AlertExplanationModal';

interface AlertsPanelProps {
  alerts: WeatherAlert[];
  locationName?: string;
  liveWeatherData?: any;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  locationName = 'Current Location',
  liveWeatherData,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

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
            className={`p-4 rounded-2xl border ${borderBg} flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/20 dark:bg-black/20 flex-none mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-tight">{alert.title}</h4>
                <p className="text-xs opacity-90 mt-0.5">{alert.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedAlert(alert.type || alert.title)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Why am I receiving this?
              </button>
              <button
                onClick={() => setSelectedAlert(alert.type || alert.title)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> What should I do?
              </button>
            </div>
          </div>
        );
      })}

      <AlertExplanationModal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        alertType={selectedAlert || ''}
        locationName={locationName}
        liveWeatherData={liveWeatherData}
      />
    </div>
  );
};
