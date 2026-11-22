import React from 'react';
import { Volume2, Zap, Maximize2, ShieldCheck, Download } from 'lucide-react';

interface EvaluationResultViewProps {
  evaluation: {
    score: number;
    overview: string;
    voiceMetrics?: {
      pronunciation: number;
      pace: number;
      clarity: number;
      content: number;
      tips: string[];
      pronunciationExamples?: string[];
    };
  };
  onDownloadReport: () => void;
  onRestart: () => void;
}

export const EvaluationResultView: React.FC<EvaluationResultViewProps> = ({
  evaluation,
  onDownloadReport,
  onRestart
}) => {
  return (
    <div className="space-y-8 text-center py-12">
      <div className="text-6xl font-bold text-blue-400 tracking-tighter shimmer">
        {evaluation.score}
      </div>
      <p className="text-[10px] uppercase text-slate-500 tracking-[0.4em] font-bold">
        Session Evaluation Score
      </p>

      {evaluation.voiceMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-4">
          {[
            { label: 'Pronunciation', val: evaluation.voiceMetrics.pronunciation, icon: Volume2 },
            { label: 'Pace', val: evaluation.voiceMetrics.pace, icon: Zap },
            { label: 'Clarity', val: evaluation.voiceMetrics.clarity, icon: Maximize2 },
            { label: 'Content', val: evaluation.voiceMetrics.content, icon: ShieldCheck }
          ].map((m, i) => (
            <div key={i} className="p-4 bg-slate-800/50 border border-white/5 rounded-xl">
              <m.icon className="w-4 h-4 text-blue-400 mx-auto mb-2" />
              <p className="text-[8px] uppercase font-bold text-slate-500 mb-1">{m.label}</p>
              <p className="text-xl font-bold text-white">{m.val}%</p>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-xl mx-auto p-8 bg-slate-900 border border-white/5 rounded-2xl text-left text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
        <p className="text-[10px] uppercase text-blue-400 font-bold mb-4 tracking-widest">
          Adversarial Synthesis
        </p>
        {evaluation.overview}

        {evaluation.voiceMetrics?.pronunciationExamples && evaluation.voiceMetrics.pronunciationExamples.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] uppercase text-amber-400 font-bold mb-3 tracking-widest">
              Pronunciation Watchlist
            </p>
            <div className="flex flex-wrap gap-2">
              {evaluation.voiceMetrics.pronunciationExamples.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 font-bold italic"
                >
                  "{word}"
                </span>
              ))}
            </div>
          </div>
        )}

        {evaluation.voiceMetrics?.tips && evaluation.voiceMetrics.tips.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] uppercase text-emerald-400 font-bold mb-3 tracking-widest">
              Communication Coaching
            </p>
            <ul className="space-y-2">
              {evaluation.voiceMetrics.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onDownloadReport}
          className="px-6 py-3 bg-blue-600 border border-blue-500 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Download className="w-4 h-4" />
          Download Evaluation Report (PDF)
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-slate-800 border border-white/10 rounded-xl text-slate-300 font-bold uppercase text-xs tracking-widest hover:bg-slate-700 transition-all"
        >
          Restart Laboratory
        </button>
      </div>
    </div>
  );
};
