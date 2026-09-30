import React, { useEffect, useState } from 'react';
import { HelpCircle, X, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { explainMetric } from '../services/api';
import { RAGSourcePanel, SourceItem } from './RAGSourcePanel';

interface WeatherExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric: string;
  value?: any;
  metricTitle?: string;
}

export const WeatherExplanationModal: React.FC<WeatherExplanationModalProps> = ({
  isOpen,
  onClose,
  metric,
  value,
  metricTitle,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [explanation, setExplanation] = useState<string>('');
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !metric) return;

    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `Explain ${metricTitle || metric} with value ${value !== undefined ? value : 'current'}`;
        const res = await explainMetric(metric, value, query);
        setExplanation(res.explanation);
        setSources(res.sources || []);
      } catch (err: any) {
        setError('Failed to fetch grounded weather explanation.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, metric, value, metricTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Explain {metricTitle || metric}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> RAG Knowledge
              </span>
            </h3>
            {value !== undefined && (
              <p className="text-xs text-sky-400 font-semibold mt-0.5">
                Current Value: {value}
              </p>
            )}
          </div>
        </div>

        {/* Body Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-xs font-medium text-slate-400">Retrieving official weather knowledge & guidance...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
              {explanation}
            </div>

            {/* RAG Citations */}
            <RAGSourcePanel sources={sources} />
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
