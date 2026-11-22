import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileSearch, AlertCircle, Upload, Download, CheckCircle2 } from 'lucide-react';
import { extractResumeText, getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';
import { saveResumeRecord } from '../lib/db';
import { downloadStyledPDF } from '../lib/pdfExport';
import { AtsScoreCard } from './resume/AtsScoreCard';
import { AtsFeedbackDetails } from './resume/AtsFeedbackDetails';

export default function ResumeBuilder() {
  const [content, setContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const extracted = await extractResumeText(base64, file.type);
        setContent(extracted);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const auditResume = async () => {
    setIsGenerating(true);
    try {
      const data = await getGroqChatCompletionJson(
        [
          {
            role: 'system',
            content: `You are an Elite ATS Forensic Auditor. Analyze the provided resume against the target job description. Provide a match score, identify missing keywords, and give critical structural feedback to pass advanced screening algorithms.
You MUST reply with a JSON object in this exact schema:
{
  "atsScore": number,
  "missingKeywords": string[],
  "criticalReview": string[],
  "optimizedBulletPoints": string[]
}`
          },
          {
            role: 'user',
            content: `Resume Content: ${content}\n\nTarget Job Description: ${jobDescription}`
          }
        ],
        GROQ_MODEL
      );

      setResult(data);

      await saveResumeRecord({
        type: 'ats_scan',
        atsScore: data.atsScore,
        tips: data.criticalReview || [],
        content: content
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAtsReport = async () => {
    if (!result) return;
    const reportHtml = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">ATS Forensic Audit & Keyword Match Report</h2>
        <p style="color: #64748b; font-size: 12px; margin-top: 0;">Automated screening algorithms evaluation against target requirements</p>
      </div>

      <!-- Match Score Badge -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">ATS Algorithm Match Score</div>
          <div style="font-size: 13px; color: #334155; margin-top: 2px;">Calculated against target job requirements</div>
        </div>
        <div style="font-size: 38px; font-weight: 900; color: #2563eb;">${result.atsScore}%</div>
      </div>

      <!-- Missing Keywords Section -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">
          Missing Hard-Target Keywords
        </h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${(result.missingKeywords || []).map((k: string) => `
            <span style="display: inline-block; padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 11px; font-weight: 600; color: #1d4ed8;">
              ${k}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Critical Anomalies -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: #dc2626; border-bottom: 1px solid #fecaca; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">
          Critical Structural & Content Anomalies
        </h3>
        <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 12px; line-height: 1.6;">
          ${(result.criticalReview || []).map((item: string) => `
            <li style="margin-bottom: 6px;">${item}</li>
          `).join('')}
        </ul>
      </div>

      <!-- Optimized Bullet Points -->
      ${result.optimizedBulletPoints && result.optimizedBulletPoints.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #16a34a; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">
            High-Impact Suggested Bullet Points
          </h3>
          <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 12px; line-height: 1.6;">
            ${result.optimizedBulletPoints.map((bp: string) => `
              <li style="margin-bottom: 6px;">${bp}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    await downloadStyledPDF(reportHtml, `ATS_Forensic_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em]">Forensic Audit</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">ATS Structural Scanner</h2>
          <p className="text-slate-500 text-sm font-medium">Analyzing credential density against target career nodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-8 bg-slate-900/50 border border-white/[0.08] p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="space-y-6 relative z-10">
            <div className="p-6 bg-slate-950/50 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 group/upload relative cursor-pointer hover:border-blue-500/50 transition-all">
               <input 
                 type="file" 
                 onChange={handleFileUpload}
                 accept=".pdf,.docx,.doc,text/plain"
                 className="absolute inset-0 opacity-0 cursor-pointer" 
               />
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover/upload:scale-110 transition-transform">
                  {isExtracting ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" /> : <Upload className="w-5 h-5" />}
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{isExtracting ? 'Analyzing Documents...' : 'Upload Resume File'}</p>
               </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">Resume Content (Paste or Upload)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your full resume text here..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-48 focus:border-blue-500/50 outline-none transition-all resize-none font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">Target Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description to match against..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-48 focus:border-blue-500/50 outline-none transition-all resize-none font-medium"
              />
            </div>

            <button
              onClick={auditResume}
              disabled={isGenerating || !content || !jobDescription}
              className="w-full py-5 bg-blue-600 border border-blue-500 rounded-2xl flex items-center justify-center gap-4 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-pulse">Analyzing Logic...</span>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  Initiate ATS Scan
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-900 border border-white/5 p-10 rounded-[2rem] h-full min-h-[700px] flex flex-col shadow-2xl relative overflow-hidden">
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                 <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-20">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                 </div>
                 <p className="text-xs uppercase tracking-[0.4em] font-black text-slate-500">Node Standby</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col h-full space-y-10">
                <AtsScoreCard score={result.atsScore} onDownloadReport={downloadAtsReport} />
                <AtsFeedbackDetails
                  criticalReview={result.criticalReview || []}
                  missingKeywords={result.missingKeywords || []}
                  optimizedBulletPoints={result.optimizedBulletPoints}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
