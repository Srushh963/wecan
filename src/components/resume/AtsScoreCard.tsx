import React from 'react';
import { Download } from 'lucide-react';

interface AtsScoreCardProps {
  score: number;
  onDownloadReport: () => void;
}

export const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ score, onDownloadReport }) => {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
          Forensic Match Score
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black text-white tracking-tighter shimmer">{score}%</span>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Calculated</span>
        </div>
      </div>
      <button
        onClick={onDownloadReport}
        className="px-5 py-2.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shadow-lg"
      >
        <Download className="w-4 h-4" />
        Download ATS Report (PDF)
      </button>
    </div>
  );
};
