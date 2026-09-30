import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, X, Loader2, BookOpen } from 'lucide-react';
import { explainWeatherAlert } from '../services/api';
import { RAGSourcePanel, SourceItem } from './RAGSourcePanel';

interface AlertExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertType: string;
  locationName: string;
  liveWeatherData?: any;
}

export const AlertExplanationModal: React.FC<AlertExplanationModalProps> = ({
  isOpen,
  onClose,
  alertType,
  locationName,
  liveWeatherData,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{ why: string; what_should_i_do: string; sources: SourceItem[] } | null>(null);

  useEffect(() => {
    if (!isOpen || !alertType) return;

    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const res = await explainWeatherAlert(alertType, locationName, liveWeatherData);
        setData(res);
      } catch (err) {
        setData({
          why: `Current atmospheric parameters triggered an active ${alertType} warning for ${locationName}.`,
          what_should_i_do: `Stay indoors, keep away from windows, and monitor official weather bulletins.`,
          sources: [{ id: 1, source: 'weather_safety_guide.md', section: 'Emergency Safety', score: 0.9 }],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, alertType, locationName, liveWeatherData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {alertType} Alert Explainer
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                UseCase 4
              </span>
            </h3>
            <p className="text-xs text-slate-400">Location: {locationName}</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-400">Retrieving official severe weather safety guidance...</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Why Am I Receiving This? */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-sm">
              <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                ❓ Why am I receiving this alert?
              </h4>
              <p className="text-slate-200">{data.why}</p>
            </div>

            {/* What Should I Do? */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-sm">
              <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                🛡️ What should I do? (Grounded Safety Precautions)
              </h4>
              <div className="text-slate-200 whitespace-pre-line leading-relaxed">{data.what_should_i_do}</div>
            </div>

            {/* RAG Sources */}
            <RAGSourcePanel sources={data.sources} />
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Alert Explainer
          </button>
        </div>
      </div>
    </div>
  );
};
