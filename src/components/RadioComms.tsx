import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Radio, Volume2, Mic, Settings } from 'lucide-react';

export default function RadioComms() {
  const [vol, setVol] = useState(80);
  const [micGain, setMicGain] = useState(65);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 p-12">
      <div className="relative">
         <div className="absolute inset-0 bg-orange-500/20 blur-3xl animate-pulse" />
         <Radio className="w-24 h-24 text-orange-500 relative z-10" />
      </div>

      <div className="text-center space-y-2">
         <h4 className="text-2xl font-serif text-white uppercase tracking-widest">Neural VOX Uplink</h4>
         <p className="text-[10px] text-white/40 font-mono uppercase tracking-[0.4em]">Protocol: DUPLEX_COMM_SECURE</p>
      </div>

      <div className="w-full max-w-xs space-y-6">
         <div className="space-y-4">
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-white/40">
               <span>Master Output</span>
               <span>{vol}%</span>
            </div>
            <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${vol}%` }}
                 className="h-full bg-orange-500 shadow-[0_0_10px_orange]" 
               />
               <input 
                 type="range" value={vol} onChange={e => setVol(parseInt(e.target.value))}
                 className="absolute inset-0 opacity-0 cursor-pointer"
               />
            </div>
         </div>

         <div className="space-y-4">
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-white/40">
               <span>Mic Sensitivity</span>
               <span>{micGain}%</span>
            </div>
            <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${micGain}%` }}
                 className="h-full bg-orange-500 shadow-[0_0_10px_orange]" 
               />
               <input 
                 type="range" value={micGain} onChange={e => setMicGain(parseInt(e.target.value))}
                 className="absolute inset-0 opacity-0 cursor-pointer"
               />
            </div>
         </div>
      </div>

      <div className="flex gap-4">
         <button className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Settings className="w-3 h-3" />
            Advanced
         </button>
         <button className="flex items-center gap-2 px-6 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] uppercase font-bold text-orange-500 hover:bg-orange-500/20 transition-all">
            <Mic className="w-3 h-3" />
            Test Link
         </button>
      </div>
    </div>
  );
}
