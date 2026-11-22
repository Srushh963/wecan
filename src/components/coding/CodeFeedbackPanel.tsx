import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface CodeFeedbackPanelProps {
  feedback: {
    isCorrect: boolean;
    score: number;
    timeComplexity: string;
    spaceComplexity: string;
    strengths?: string[];
    edgeCasesMissed?: string[];
    optimizedAlternative?: string;
  };
}

export const CodeFeedbackPanel: React.FC<CodeFeedbackPanelProps> = ({ feedback }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
              feedback.isCorrect
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {feedback.isCorrect ? 'Accepted' : 'Needs Optimization'}
          </span>
          <span className="text-xl font-black text-white">{feedback.score}/100</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>
            Time: <strong className="text-blue-400">{feedback.timeComplexity}</strong>
          </span>
          <span>
            Space: <strong className="text-blue-400">{feedback.spaceComplexity}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="space-y-1.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {feedback.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {feedback.edgeCasesMissed && feedback.edgeCasesMissed.length > 0 && (
          <div className="space-y-1.5 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl">
            <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5" /> Edge Cases To Handle
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {feedback.edgeCasesMissed.map((ec: string, i: number) => (
                <li key={i}>{ec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {feedback.optimizedAlternative && (
        <div className="p-3.5 bg-slate-950 rounded-xl border border-white/5 space-y-1.5">
          <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase text-[10px]">
            <Lightbulb className="w-3.5 h-3.5" /> Optimal Pattern / Hints
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
            {feedback.optimizedAlternative}
          </p>
        </div>
      )}
    </motion.div>
  );
};
