import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Link2, Search, Zap, ExternalLink, Library } from 'lucide-react';
import { getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';
import { getUserTests } from '../lib/db';

export default function ResourceFinder() {
  const [resources, setResources] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [targetRole, setTargetRole] = useState('');

  const syncResources = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch historical analytics
      let historyText = "";
      const tests = await getUserTests(5);
      if (tests.length > 0) {
        const testData = tests.map(t => `${t.topic}: ${t.score}%`).join('\n');
        historyText = `User historical test scores:\n${testData}`;
      }

      // 2. Generate resources
      const data = await getGroqChatCompletionJson(
        [
          {
            role: 'system',
            content: `You are a Professional Career Librarian. Based on the user's target role and recent test analytics, suggest 5 high-quality, professional resources (Documentation, Courses, or Articles). Focus on closing the gap in their weak areas.
You MUST reply with a JSON object containing a "resources" array in this exact schema:
{
  "resources": [
    {
      "title": "string",
      "type": "COURSE" | "DOCUMENTATION" | "WHITEPAPER" | "ARTICLE",
      "source": "string",
      "url": "string",
      "relevance": "string"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Target Role: ${targetRole}\n${historyText}`
          }
        ],
        GROQ_MODEL
      );

      const parsedResources = Array.isArray(data) ? data : (data?.resources || []);
      setResources(parsedResources);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Dynamic Resource Node</h2>
          <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Adaptive Skill Augmentation</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            value={targetRole} onChange={e => setTargetRole(e.target.value)}
            className="md:w-64 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
            placeholder="Re-calibrate target role..."
          />
          <button 
            onClick={syncResources}
            disabled={isSyncing || !targetRole}
            className="py-3 px-8 bg-blue-600 border border-blue-500 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
          >
            {isSyncing ? (
              <Zap className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Sync Resources
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-8 bg-slate-900 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                     <Library className="w-5 h-5" />
                  </div>
                  <span className="px-3 py-1 bg-white/[0.02] border border-white/10 rounded-full text-[8px] font-black tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">
                     {res.type}
                  </span>
               </div>
               
               <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{res.title}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{res.source}</p>
               </div>

               <p className="text-xs text-slate-400 leading-relaxed font-normal bg-slate-950/50 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-blue-500 block mb-1">AI Relevance Note</span>
                  {res.relevance}
               </p>
            </div>

            <a 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 w-full py-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center gap-3 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all text-xs font-bold uppercase tracking-widest"
            >
               Resource Link <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>

      {!resources.length && !isSyncing && (
        <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 bg-slate-900/50 rounded-[3rem] opacity-20 shadow-xl">
           <BookOpen className="w-16 h-16 mb-4" />
           <p className="text-sm uppercase font-black tracking-widest text-center max-w-[200px]">Synchronize with Terminal to find curated nodes.</p>
        </div>
      )}
    </div>
  );
}
