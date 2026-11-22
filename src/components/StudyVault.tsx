import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, Circle, TrendingUp, Search } from 'lucide-react';
import { getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';
import { saveStudyPlan } from '../lib/db';

export default function StudyVault() {
  const [role, setRole] = useState('Senior Software Engineer');
  const [learningPath, setLearningPath] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePath = async () => {
    setIsGenerating(true);
    try {
      const data = await getGroqChatCompletionJson(
        [
          {
            role: 'system',
            content: `You are a Senior Skill Architect. Curate a progressive learning path for the specified role. Focus on core architectural concepts, domain-specific tools, and preparation material.
You MUST reply with a JSON object in this exact schema:
{
  "title": string,
  "modules": [
    {
      "title": string,
      "topics": string[],
      "priority": "CRITICAL" | "HIGH" | "MEDIUM"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Role: ${role}`
          }
        ],
        GROQ_MODEL
      );

      setLearningPath(data);
      
      await saveStudyPlan({
        title: data.title || `Learning Path: ${role}`,
        modules: data.modules || []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Study Concepts & Topic Preparation</h2>
          <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Structured Career Learning Path</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 md:w-64 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none text-white shadow-xl"
            placeholder="Target Role (e.g. Data Analyst)"
          />
          <button 
            onClick={generatePath}
            disabled={isGenerating}
            className="p-4 bg-blue-600 border border-blue-500 rounded-xl hover:bg-blue-500 transition-all text-white shadow-lg profession-glow"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!learningPath ? (
               <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 bg-slate-900 rounded-2xl opacity-20 shadow-xl">
                  <BookOpen className="w-12 h-12 mb-4" />
                  <p className="text-xs uppercase tracking-widest font-bold">Awaiting Curation</p>
               </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {learningPath.modules.map((module: any, i: number) => (
                  <div key={i} className="group p-8 bg-slate-900 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                           {i+1}
                        </div>
                        <h4 className="text-xl font-bold text-white tracking-tight">{module.title}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                        module.priority === 'CRITICAL' ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-slate-800 text-slate-500 border-white/5'
                      }`}>
                        {module.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {module.topics.map((topic: string, j: number) => (
                        <div key={j} className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group">
                           <Circle className="w-3 h-3 text-slate-600 group-hover:text-blue-500" />
                           <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-2xl shadow-inner">
             <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h5 className="font-bold text-white uppercase tracking-widest text-xs">Curriculum Analytics</h5>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                Our AI engine curates high-impact topics specifically for your target domain.
             </p>
             <div className="space-y-4">
                <label className="block text-[10px] text-slate-600 uppercase font-black tracking-widest">Global Progress</label>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-[0%] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-blue-500">
                   <span>IDLE</span>
                   <span>0% COMPLETE</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>

  );
}
