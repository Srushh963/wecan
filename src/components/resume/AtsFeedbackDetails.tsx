import React from 'react';

interface AtsFeedbackDetailsProps {
  criticalReview: string[];
  missingKeywords: string[];
  optimizedBulletPoints?: string[];
}

export const AtsFeedbackDetails: React.FC<AtsFeedbackDetailsProps> = ({
  criticalReview,
  missingKeywords,
  optimizedBulletPoints
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-[9px] text-rose-500 uppercase font-black tracking-widest">
            Critical Anomalies
          </p>
          <ul className="space-y-4">
            {criticalReview.map((r: string, i: number) => (
              <li
                key={i}
                className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-slate-300 leading-relaxed font-medium"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <p className="text-[9px] text-blue-500 uppercase font-black tracking-widest">
            Missing Key Nodes
          </p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((k: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] text-blue-400 font-bold uppercase tracking-wider"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      {optimizedBulletPoints && (
        <div className="p-10 bg-slate-950/50 border border-white/5 rounded-3xl space-y-6 backdrop-blur-xl">
          <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest">
            Optimized Bullet Syntheses
          </p>
          <ul className="grid grid-cols-1 gap-4">
            {optimizedBulletPoints.map((bp: string, i: number) => (
              <li key={i} className="text-[11px] text-slate-400 leading-relaxed font-medium flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {bp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
