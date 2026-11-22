import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ResumeBuilder from './ResumeBuilder';
import AnalyticsVault from './AnalyticsVault';
import VaultSimulator from './VaultSimulator';
import QAGenerator from './QAGenerator';
import ProfileSetup from './ProfileSetup';
import VoiceResumeBuilder from './VoiceResumeBuilder';
import WrittenTest from './WrittenTest';
import ResourceFinder from './ResourceFinder';
import CoverLetterGenerator from './CoverLetterGenerator';
import LiveCodingWorkbench from './LiveCodingWorkbench';
import SalaryCareerCompass from './SalaryCareerCompass';
import { 
  Terminal, 
  Code2,
  Mic, 
  BarChart3, 
  ChevronRight,
  Activity,
  LogOut,
  User as UserIcon,
  Search,
  Settings,
  ShieldCheck,
  FileSearch,
  FileText,
  Binary,
  Compass
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { stopAllSpeechAndAudio } from '../lib/soundManager';

type ModuleId = 
  | 'profile' 
  | 'voice-resume' 
  | 'ats-scan' 
  | 'qa' 
  | 'written' 
  | 'interview' 
  | 'coding-arena' 
  | 'cover-letter' 
  | 'salary-compass' 
  | 'resources' 
  | 'analytics';

interface UserProfile {
  photoURL?: string;
  displayName?: string;
  email?: string;
}

export default function WarMap({ user }: { user: UserProfile }) {
  const [activeModule, setActiveModule] = useState<ModuleId>('profile');

  const handleModuleChange = (newModule: ModuleId) => {
    stopAllSpeechAndAudio();
    setActiveModule(newModule);
  };

  const handleLogout = async () => {
    stopAllSpeechAndAudio();
    try {
      await supabase.auth.signOut();
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { id: 'profile', label: '1. Onboarding', icon: Settings, desc: 'Profile Calibration' },
    { id: 'voice-resume', label: '2. Voice Resume', icon: Mic, desc: 'Oral Synthesis' },
    { id: 'ats-scan', label: '3. ATS Scan', icon: FileSearch, desc: 'Structural Integrity' },
    { id: 'qa', label: '4. Practice Q&A', icon: Terminal, desc: 'Logic Preparation' },
    { id: 'written', label: '5. Written Test', icon: Code2, desc: 'Domain Assessment' },
    { id: 'coding-arena', label: '6. Coding Arena', icon: Binary, desc: 'Live Code Sandbox' },
    { id: 'interview', label: '7. Mock Interview', icon: ShieldCheck, desc: 'STAR & Voice Simulator' },
    { id: 'cover-letter', label: '8. Cover Letter', icon: FileText, desc: 'Application Generator' },
    { id: 'salary-compass', label: '9. Career & Salary', icon: Compass, desc: 'Market Intelligence' },
    { id: 'resources', label: '10. Resource Hub', icon: Search, desc: 'Adaptive Learning' },
    { id: 'analytics', label: '11. Performance', icon: BarChart3, desc: 'Heuristic Analytics' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 font-sans flex overflow-hidden">
      {/* Structural Professional Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-20" />
      </div>

      {/* Side Navigation Rail */}
      <aside className="w-72 bg-slate-900 border-r border-white/5 z-30 flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h1 className="text-2xl font-bold tracking-tight text-white">WeCan</h1>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-medium">Professional Career Coach</p>
        </div>

        {/* Navigation Rail */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide" aria-label="Main Navigation">
          <div className="px-4 py-2 mb-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Workspace</p>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              role="button"
              aria-current={activeModule === item.id ? 'page' : undefined}
              aria-label={item.label}
              onClick={() => handleModuleChange(item.id as any)}
              className={`w-full group px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-300 ${
                activeModule === item.id 
                  ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white' 
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-colors ${activeModule === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <div className="flex-1 text-left">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${activeModule === item.id ? 'text-white' : ''}`}>
                  {item.label}
                </p>
                <p className={`text-[9px] font-medium ${activeModule === item.id ? 'text-blue-100/60' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
              <ChevronRight className={`w-3 h-3 transition-all duration-300 ${activeModule === item.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
            </button>
          ))}
        </nav>

        {/* User Profile & Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <UserIcon className="w-4 h-4 text-blue-400" />
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[11px] font-bold text-white truncate">{user?.displayName || 'Candidate'}</p>
               <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
          >
             <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
             <span className="text-[11px] font-bold uppercase tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 relative flex flex-col z-10 bg-slate-950">
        {/* Top Control Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Current Module</span>
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] text-white">
                 {menuItems.find(m => m.id === activeModule)?.label}
              </h2>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Online</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Copilot Ready</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-10 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all text-[10px] font-bold uppercase tracking-widest">
               Notifications
            </button>
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
               <Activity className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 p-10 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeModule === 'profile' && <ProfileSetup onComplete={() => setActiveModule('voice-resume')} />}
                {activeModule === 'voice-resume' && <VoiceResumeBuilder />}
                {activeModule === 'ats-scan' && <ResumeBuilder />}
                {activeModule === 'qa' && <QAGenerator />}
                {activeModule === 'written' && <WrittenTest />}
                {activeModule === 'coding-arena' && <LiveCodingWorkbench />}
                {activeModule === 'interview' && <VaultSimulator mode="technical" />}
                {activeModule === 'cover-letter' && <CoverLetterGenerator />}
                {activeModule === 'salary-compass' && <SalaryCareerCompass />}
                {activeModule === 'resources' && <ResourceFinder />}
                {activeModule === 'analytics' && <AnalyticsVault />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>

  );
}



