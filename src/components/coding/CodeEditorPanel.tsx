import React from 'react';
import { Play, Terminal } from 'lucide-react';

interface CodeEditorPanelProps {
  language: string;
  userCode: string;
  isEvaluating: boolean;
  onCodeChange: (code: string) => void;
  onReviewCode: () => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  language,
  userCode,
  isEvaluating,
  onCodeChange,
  onReviewCode,
}) => {
  const fileExtension = language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'ts';

  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex flex-col flex-1 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>solution.{fileExtension}</span>
        </div>
        <button
          onClick={onReviewCode}
          disabled={isEvaluating || !userCode}
          aria-label="Run and review solution code"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          {isEvaluating ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3 h-3 fill-current" />
          )}
          <span>Run & Review Code</span>
        </button>
      </div>

      <textarea
        value={userCode}
        onChange={(e) => onCodeChange(e.target.value)}
        aria-label="Code Editor"
        className="w-full h-80 bg-slate-950 font-mono text-xs text-blue-200 p-4 rounded-2xl mt-4 focus:outline-none focus:border-blue-500 border border-white/5 resize-none leading-relaxed"
        placeholder="// Write your solution here..."
        spellCheck={false}
      />
    </div>
  );
};
