import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, TrendingUp, Compass, Award, ShieldAlert, Sparkles, MapPin, Briefcase } from 'lucide-react';
import { getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';

interface SalaryInsight {
  role: string;
  location: string;
  entryLevelRange: string;
  midLevelRange: string;
  topTierRange: string;
  mustHaveSkills: string[];
  negotiationTips: string[];
  recommendedCertifications: string[];
}

export default function SalaryCareerCompass() {
  const [role, setRole] = useState('Frontend Engineer');
  const [location, setLocation] = useState('Remote / India / US');
  const [experience, setExperience] = useState('Entry-Level (0-2 YOE)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<SalaryInsight | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const data = await getGroqChatCompletionJson<SalaryInsight>(
        [
          {
            role: 'system',
            content: `You are a Global Tech Compensation and Career Intelligence Strategist. Provide real-world market salary benchmarks and career growth advice for students and jobseekers.
Target Role: ${role}.
Target Location: ${location}.
Experience Bracket: ${experience}.

You MUST return a JSON object with this exact schema:
{
  "role": "string",
  "location": "string",
  "entryLevelRange": "string",
  "midLevelRange": "string",
  "topTierRange": "string",
  "mustHaveSkills": ["string"],
  "negotiationTips": ["string"],
  "recommendedCertifications": ["string"]
}`
          },
          {
            role: 'user',
            content: `Analyze compensation bands, high-value skills, and leverage tips for ${role} in ${location} at ${experience}.`
          }
        ],
        GROQ_MODEL
      );

      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20 font-sans">
      <div className="border-b border-white/5 pb-8 space-y-2">
        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em]">Market Intelligence</p>
        <h2 className="text-4xl font-extrabold tracking-tight text-white">Salary & Career Compass</h2>
        <p className="text-slate-500 text-sm font-medium">Explore compensation brackets, high-paying tech stacks, and student negotiation leverage.</p>
      </div>

      {/* Input Controls */}
      <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Target Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Fullstack Engineer"
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Market / Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. India (Bengaluru), US, Remote"
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Experience Bracket</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option>Intern / College Graduate</option>
            <option>Entry-Level (0-2 YOE)</option>
            <option>Mid-Level (2-5 YOE)</option>
            <option>Senior Engineer (5+ YOE)</option>
          </select>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Explore Brackets</span>
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {insights && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Compensation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl relative overflow-hidden group">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entry / Baseline</span>
              <div className="text-2xl font-black text-white mt-2 mb-1">{insights.entryLevelRange}</div>
              <p className="text-xs text-slate-400">Campus placements and junior roles</p>
            </div>

            <div className="p-6 bg-slate-900 border border-blue-500/30 rounded-3xl relative overflow-hidden group shadow-[0_0_20px_rgba(37,99,235,0.15)]">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mid-Market Standard</span>
              <div className="text-2xl font-black text-blue-400 mt-2 mb-1">{insights.midLevelRange}</div>
              <p className="text-xs text-slate-400">Proven contributors with 2+ years impact</p>
            </div>

            <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-3xl relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Top-Tier / Unicorn Range</span>
              <div className="text-2xl font-black text-emerald-400 mt-2 mb-1">{insights.topTierRange}</div>
              <p className="text-xs text-slate-400">High-growth startups & Big Tech offers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Must Have Skills */}
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> High-Value Skills Driving Compensation
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights.mustHaveSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-semibold text-blue-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Negotiation Tips */}
            <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" /> Offer Negotiation Tactics for Students
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {insights.negotiationTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
