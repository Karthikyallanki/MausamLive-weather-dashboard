import React from 'react';
import { BookOpen, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface SourceItem {
  id: number;
  source: string;
  section?: string;
  category?: string;
  authority?: string;
  score?: number;
}

interface RAGSourcePanelProps {
  sources: SourceItem[];
}

export const RAGSourcePanel: React.FC<RAGSourcePanelProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs">
      <div className="flex items-center gap-1.5 text-sky-400 font-bold mb-2.5">
        <BookOpen className="w-4 h-4 text-sky-400" />
        <span>Retrieved Knowledge Sources & Citations:</span>
      </div>

      <div className="space-y-2">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 rounded-xl px-3 py-2 text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-400 text-xs">{idx + 1}.</span>
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="font-semibold text-slate-100">{src.source}</span>
                {src.section && (
                  <span className="text-slate-400 ml-1.5 font-normal">— Section: {src.section}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Official
              </span>
              {src.score !== undefined && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">
                  {Math.round(src.score * 100)}% match
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
