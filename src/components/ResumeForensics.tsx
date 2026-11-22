import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auditResume } from '../lib/groq';
import { FileText, ShieldAlert, Cpu, Activity } from 'lucide-react';

export default function ResumeForensics() {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!resumeText) return;
    setIsScanning(true);
    try {
      const result = await auditResume(resumeText, "Senior Software Engineer");
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto p-8 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center gap-4 mb-8">
        <Cpu className="w-8 h-8 text-sky-400" />
        <h3 className="text-3xl font-serif etched-glass uppercase tracking-widest">Resume Forensics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block font-mono text-[10px] text-sky-400 uppercase tracking-widest">Input Raw Blueprint</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="w-full h-64 bg-black/60 border border-white/10 rounded-lg p-4 font-mono text-sm text-white/80 focus:border-sky-500/50 outline-none transition-all resize-none"
            placeholder="Paste raw resume text here for structural audit..."
          />
          <button
            onClick={handleScan}
            disabled={isScanning || !resumeText}
            className="w-full py-4 bg-sky-500/10 border border-sky-500/30 rounded-lg font-serif text-sky-400 uppercase tracking-widest hover:bg-sky-500/20 transition-all disabled:opacity-50"
          >
            {isScanning ? 'Scannning Integrity...' : 'Initiate Forensic Scan'}
          </button>
        </div>

        <div className="relative min-h-[300px] border border-white/5 rounded-lg bg-black/20 p-6 overflow-hidden">
          {isScanning && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="structural-integrity-beam w-full absolute top-0" />
            </div>
          )}

          <AnimatePresence mode="wait">
            {!analysis ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <FileText className="w-12 h-12 mb-4" />
                <p className="font-mono text-xs uppercase tracking-widest">Waiting for structural input</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="font-mono text-[8px] text-white/40 uppercase mb-1">Integrity</p>
                    <p className="text-2xl font-mono text-sky-400">{analysis.integrityScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[8px] text-white/40 uppercase mb-1">Impact</p>
                    <p className="text-2xl font-mono text-emerald-400">{analysis.quantifiableImpact}%</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[8px] text-white/40 uppercase mb-1">Entropy</p>
                    <p className="text-2xl font-mono text-rose-400">{analysis.keywordEntropy}%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-mono text-[10px] uppercase text-rose-400">Hard-Target Gap Detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-rose-500/5 border border-rose-500/20 text-rose-400 font-mono text-[9px] uppercase tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="font-mono text-[10px] text-white/60 leading-relaxed italic">
                    {analysis.forensicAnalysis}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
