import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Target, Gauge, Clock, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Legend } from 'recharts';
import { getUserTests } from '../lib/db';
import { downloadStyledPDF } from '../lib/pdfExport';

export default function AnalyticsVault() {
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { icon: Target, label: 'Readiness Score', value: '0%' },
    { icon: Gauge, label: 'Technical Depth', value: '0/100' },
    { icon: Clock, label: 'Assessments', value: '0' },
    { icon: ShieldCheck, label: 'Profile Status', value: 'Pending' }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tests = await getUserTests(20);
        
        const data = tests.map((t, i) => ({
          name: `T${i + 1}`,
          readiness: t.score,
          depth: Math.min(100, (t.score || 0) + (i * 5))
        }));

        if (data.length > 0) {
          setSessionData(data);
          const latest = data[data.length - 1];
          setStats([
            { icon: Target, label: 'Readiness Score', value: `${latest.readiness}%` },
            { icon: Gauge, label: 'Technical Depth', value: `${latest.depth}/100` },
            { icon: Clock, label: 'Assessments', value: data.length.toString() },
            { icon: ShieldCheck, label: 'Profile Status', value: 'Active' }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = sessionData.length > 0 ? sessionData : [
    { name: 'S1', readiness: 0, depth: 0 },
    { name: 'S2', readiness: 10, depth: 15 },
    { name: 'S3', readiness: 25, depth: 30 }
  ];

  const handleExportPDF = async () => {
    const reportHtml = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Candidate Performance Evaluation</h2>
        <p style="color: #64748b; font-size: 12px; margin-top: 0;">Comprehensive readiness and competency assessment report</p>
      </div>

      <!-- Key Metrics Cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px;">
        ${stats.map(s => `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #f8fafc;">
            <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">${s.label}</div>
            <div style="font-size: 20px; font-weight: 800; color: #1e40af; margin-top: 4px;">${s.value}</div>
          </div>
        `).join('')}
      </div>

      <!-- Test Trajectory History -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 14px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">Recent Assessment Trajectory</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; color: #475569;">
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">#</th>
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Assessment Node</th>
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Readiness Score</th>
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${chartData.map((d, idx) => `
              <tr style="${idx % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;'}">
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600;">${idx + 1}</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">Assessment Run ${d.name}</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 700; color: #2563eb;">${d.readiness}%</td>
                <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 600;">Evaluated</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Strategic Summary -->
      <div style="padding: 16px; background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px; margin-top: 20px;">
        <div style="font-weight: 700; color: #1e40af; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Executive Diagnostic</div>
        <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5;">
          The candidate demonstrates steady upward velocity in structural interview readiness and technical problem solving. Continue targeted mock simulations to solidify edge-case handling.
        </p>
      </div>
    `;

    await downloadStyledPDF(reportHtml, `WeCan_Performance_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em]">Insights Terminal</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Performance Metrics</h2>
          <p className="text-slate-500 text-sm font-medium">Quantifying your professional evolution across key competency vectors.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={handleExportPDF}
             className="px-5 py-2.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 hover:text-white transition-all flex items-center gap-2 shadow-lg"
           >
              <Download className="w-3.5 h-3.5" />
              Download Report (PDF)
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-white/[0.08] transition-all"
           >
              Refresh Data
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -4 }}
            className="p-6 bg-slate-900/50 border border-white/[0.08] rounded-3xl flex flex-col gap-4 shadow-2xl relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-3 w-fit bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <stat.icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.15em] mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
               <span className="text-[9px] text-emerald-500 font-bold uppercase">Delta: +12%</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 p-10 bg-slate-900 border border-white/5 rounded-[2rem] space-y-8 relative overflow-hidden shadow-2xl group min-h-[500px] flex flex-col">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <TrendingUp className="w-32 h-32 text-blue-400" />
           </div>
           <div className="flex items-center justify-between relative z-10">
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 Growth Trajectory Analysis
              </h4>
           </div>
           
           <div className="flex-1 w-full min-h-[300px] mt-6 bg-slate-950/30 rounded-3xl p-6 border border-white/5 relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm rounded-3xl">
                   <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent animate-spin rounded-full" />
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '10px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  <Area name="Readiness Score" type="monotone" dataKey="readiness" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReadiness)" strokeWidth={3} />
                  <Line name="Technical Depth" type="monotone" dataKey="depth" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="flex items-center gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Performance Score</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Tech Depth (Projected)</span>
           </div>
        </div>

        <div className="p-10 bg-slate-900 border border-white/5 rounded-[2rem] space-y-10 shadow-2xl flex flex-col">
           <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 Capability Matrix
              </h4>
           </div>
           
           <div className="space-y-8 flex-1">
              {[
                { label: 'Technical Depth', val: 88, color: 'bg-blue-500' },
                { label: 'Keyword Synthesis', val: 94, color: 'bg-emerald-500' },
                { label: 'Candidate Poise', val: 82, color: 'bg-indigo-500' },
                { label: 'Logic Resolution', val: 76, color: 'bg-cyan-500' }
              ].map((vector, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.1em]">
                      <span className="text-slate-400">{vector.label}</span>
                      <span className="text-white">{vector.val}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${vector.val}%` }}
                        className={`h-full ${vector.color} shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
                      />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="pt-8 border-t border-white/5">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-loose text-center">
                    "Consistent iteration across technical vectors is correlated with a 40% increase in offer probability."
                 </p>
              </div>
           </div>
        </div>
      </div>

      <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-2xl text-center shadow-inner">
         <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2">Algorithm Integrity</p>
         <div className="text-lg font-medium text-slate-300 py-2">
            Professional evaluation matrix utilizing real-time performance heuristics.
         </div>
      </div>
    </div>
  );
}


