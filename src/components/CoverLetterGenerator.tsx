import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Building2, Send, Download, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { getGroqChatCompletion, GROQ_MODEL } from '../lib/groq';
import { downloadStyledPDF } from '../lib/pdfExport';

export default function CoverLetterGenerator() {
  const [targetCompany, setTargetCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userBackground, setUserBackground] = useState('');
  const [tone, setTone] = useState<'confident' | 'enthusiastic' | 'technical'>('confident');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!targetCompany || !jobTitle) return;
    setIsGenerating(true);
    setGeneratedLetter('');

    try {
      const prompt = `Write a high-converting, personalized, modern cover letter for a candidate applying for the position of "${jobTitle}" at "${targetCompany}".
Tone: ${tone}.
Target Job Requirements / Description:
${jobDescription || 'Standard requirements for this role in industry.'}

Candidate Profile & Key Highlights:
${userBackground || 'Motivated student/graduate with strong foundational engineering skills, fast learning ability, and hands-on projects.'}

Instructions:
- Avoid generic AI clichés ("I am writing with immense pleasure", "delighted to apply").
- Sound authentic, direct, and focused on value creation.
- Emphasize problem-solving, project impact, and alignment with the company's engineering goals.
- Keep it concise (3-4 impactful paragraphs).`;

      const response = await getGroqChatCompletion([
        {
          role: 'system',
          content: 'You are an executive career advisor specializing in high-placement cover letters for tech and engineering candidates.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], GROQ_MODEL);

      setGeneratedLetter(response.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!generatedLetter) return;
    const letterHtml = `
      <div style="font-family: inherit; color: #1e293b;">
        <div style="margin-bottom: 24px;">
          <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px;">Application Cover Letter</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${jobTitle} • ${targetCompany}</div>
        </div>
        <div style="font-size: 13px; line-height: 1.8; color: #334155; white-space: pre-wrap; margin-bottom: 24px;">
          ${generatedLetter}
        </div>
      </div>
    `;
    await downloadStyledPDF(letterHtml, `Cover_Letter_${targetCompany.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20 font-sans">
      <div className="border-b border-white/5 pb-8 space-y-2">
        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em]">Application Accelerator</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">AI Cover Letter Architect</h1>
        <p className="text-slate-500 text-sm font-medium">Generate role-tailored, authentic cover letters that stand out to hiring managers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="space-y-1.5">
              <label htmlFor="cover-target-company" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> Target Company
              </label>
              <input
                id="cover-target-company"
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Google, Stripe, Microsoft"
                aria-label="Target Company"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cover-job-title" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Job Title
              </label>
              <input
                id="cover-job-title"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer Intern"
                aria-label="Job Title"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Tone Preference
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Tone Preference">
                {(['confident', 'enthusiastic', 'technical'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tone === t}
                    onClick={() => setTone(t)}
                    className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                      tone === t
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cover-job-desc" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Job Description Highlights (Optional)
              </label>
              <textarea
                id="cover-job-desc"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste key responsibilities or required technologies..."
                aria-label="Job Description Highlights"
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cover-user-bg" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Your Projects / Standout Skills
              </label>
              <textarea
                id="cover-user-bg"
                value={userBackground}
                onChange={(e) => setUserBackground(e.target.value)}
                placeholder="e.g. Built a real-time collaborative code editor with WebSockets; 200+ LeetCode solved."
                aria-label="Your Projects or Standout Skills"
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !targetCompany || !jobTitle}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Cover Letter</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-white/5 p-8 rounded-3xl min-h-[560px] flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Generated Document
              </span>
              {generatedLetter && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 pt-6">
              {!generatedLetter ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-24 text-slate-500">
                  <Briefcase className="w-12 h-12 stroke-[1.2] opacity-30" />
                  <p className="text-xs uppercase tracking-widest font-semibold">
                    Fill in target company & role to generate
                  </p>
                </div>
              ) : (
                <textarea
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="w-full h-[440px] bg-slate-950/60 border border-white/5 rounded-2xl p-6 text-sm text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
