import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { saveProfile, getProfile } from '../lib/db';
import { User, Briefcase, GraduationCap, Globe } from 'lucide-react';

export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    role: '',
    experience: 'Entry Level',
    domain: '',
    targetJob: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getProfile().then((existing) => {
      if (existing) {
        setFormData({
          role: existing.role || '',
          experience: existing.experience || 'Entry Level',
          domain: existing.domain || '',
          targetJob: existing.targetJob || ''
        });
      }
    });
  }, []);

  const handleSave = async () => {
    if (!formData.role || !formData.domain) return;
    setIsSaving(true);
    try {
      await saveProfile(formData);
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 py-12 px-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Initialize Your Profile</h2>
        <p className="text-sm text-slate-500">Configure your professional target parameters for AI calibration.</p>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-3xl p-10 space-y-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
              <Briefcase className="w-3 h-3 text-blue-500" /> Target Professional Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <GraduationCap className="w-3 h-3 text-emerald-500" /> Experience Tier
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option>Entry Level</option>
                <option>Mid-Senior</option>
                <option>Lead / Architect</option>
                <option>Managerial / Executive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
                <Globe className="w-3 h-3 text-cyan-500" /> Industry/Domain
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                placeholder="e.g. FinTech / Web3"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">Specific Target Job (Optional Link or Title)</label>
            <textarea
              value={formData.targetJob}
              onChange={(e) => setFormData({...formData, targetJob: e.target.value})}
              placeholder="e.g. Principal Architect at Google..."
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white h-24 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !formData.role || !formData.domain}
            className="w-full py-5 bg-blue-600 border border-blue-500 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-500 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] disabled:opacity-50"
          >
            {isSaving ? 'Synchronizing Profile...' : 'Finalize Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
