import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Sparkles, Send, AudioLines, FileText, Download } from 'lucide-react';
import { generateSpeech, getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';
import { saveResumeRecord } from '../lib/db';
import { downloadStyledPDF } from '../lib/pdfExport';
import { playAudioOrSpeech, stopAllSpeechAndAudio } from '../lib/soundManager';

const STAGES = [
  { id: 'basic_info', question: "Let's begin with your basic details. Please state your full name, phone number, and LinkedIn profile." },
  { id: 'education', question: "Great. Now, could you describe your latest educational qualifications, including the institution and degree?" },
  { id: 'experience', question: "Tell me about your most recent professional role. What were your primary responsibilities and key achievements?" },
  { id: 'skills', question: "What are your core technical competencies? Mention languages, tools, or frameworks you excel in." },
  { id: 'projects', question: "Can you describe a significant project you led or contributed to? Focus on the impact and your specific role." }
];

export default function VoiceResumeBuilder() {
  const [currentStage, setCurrentStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editableContent, setEditableContent] = useState('');

  const speak = async (text: string) => {
    setIsSynthesizing(true);
    const audioUrl = await generateSpeech(text);
    playAudioOrSpeech(audioUrl, text, () => setIsSynthesizing(false));
  };

  // Stop any ongoing voice playback when component unmounts (e.g. changing sections)
  useEffect(() => {
    return () => {
      stopAllSpeechAndAudio();
    };
  }, []);

  useEffect(() => {
    if (currentStage < STAGES.length && !result) {
      speak(STAGES[currentStage].question);
    }
  }, [currentStage, result]);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
      };
      recognition.start();
      setIsRecording(true);
    }
  };

  const nextStep = () => {
    if (!transcript) return;
    const key = STAGES[currentStage].id;
    setAnswers(prev => ({ ...prev, [key]: transcript }));
    setTranscript('');
    
    if (currentStage < STAGES.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      generateFinalResume({ ...answers, [key]: transcript });
    }
  };

  const generateFinalResume = async (finalAnswers: any) => {
    setIsGeneratingResume(true);
    try {
      const data = await getGroqChatCompletionJson(
        [
          {
            role: 'system',
            content: `You are a world-class Resume Architect. Transform the provided voice transcripts into a high-impact, ATS-optimized professional resume. Use LaTeX-style formatting or clean markdown. Include quantifiable impact.
You MUST reply with a JSON object in this exact schema:
{
  "content": string,
  "atsScore": number,
  "tips": string[]
}`
          },
          {
            role: 'user',
            content: JSON.stringify(finalAnswers)
          }
        ],
        GROQ_MODEL
      );

      setResult(data);
      setEditableContent(data.content || "");

      await saveResumeRecord({
        type: 'voice_generated',
        atsScore: data.atsScore,
        content: data.content,
        tips: data.tips || [],
        rawAnswers: finalAnswers
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const downloadPDF = async () => {
    // Format text nicely with clean typography for export
    const formattedContent = editableContent
      .split('\n\n')
      .map(paragraph => {
        if (paragraph.startsWith('# ') || paragraph.startsWith('## ') || paragraph.toUpperCase() === paragraph && paragraph.length < 40) {
          return `<h3 style="font-size: 14px; font-weight: 800; color: #1e40af; border-bottom: 1.5px solid #dbeafe; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase;">${paragraph.replace(/^#+\s*/, '')}</h3>`;
        }
        return `<p style="margin-bottom: 8px; line-height: 1.6; color: #334155; font-size: 12px;">${paragraph.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');

    const reportHtml = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 20px; font-weight: 800; color: #0f172a;">Candidate Professional Resume</div>
        <div style="font-size: 11px; color: #64748b; font-weight: 600;">Synthesized via WeCan Voice Architecture • ATS Match: ${result?.atsScore || 85}%</div>
      </div>
      <div style="margin-top: 14px;">
        ${formattedContent}
      </div>
    `;

    await downloadStyledPDF(reportHtml, `Professional_Resume_${Date.now()}.pdf`);
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-10 bg-slate-900 border border-white/5 rounded-[2rem] shadow-2xl space-y-8">
        <div className="flex justify-between items-start">
           <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">AI Generated Profile</h2>
              <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Voice-First Synthesis Complete</p>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter shimmer">{result.atsScore}%</span>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">ATS Match</span>
           </div>
        </div>

        <textarea
          value={editableContent}
          onChange={(e) => setEditableContent(e.target.value)}
          className="w-full h-96 bg-slate-950/50 border border-white/5 rounded-3xl p-10 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-medium border-l-4 border-l-blue-500 font-mono focus:outline-none focus:border-blue-500 transition-all resize-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-[9px] text-blue-500 uppercase font-black tracking-widest mb-4">Optimization Strategies</p>
              <ul className="space-y-2">
                {result.tips?.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
           </div>
           <div className="flex flex-col gap-4">
               <button 
                 onClick={downloadPDF}
                 className="h-full bg-emerald-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-xl py-6"
               >
                  <FileText className="w-5 h-5" /> Download as PDF
               </button>
               <button 
                 onClick={() => window.location.reload()}
                 className="h-full bg-blue-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl py-6"
               >
                  Create Another Node
               </button>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 pb-20 font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-white">Voice Resume Architect</h2>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Guided Professional Synthesis</p>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-12 min-h-[500px] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
        
        <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
               <AudioLines className={`w-6 h-6 ${isSynthesizing ? 'animate-pulse' : ''}`} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Phase {currentStage + 1} of {STAGES.length}</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{STAGES[currentStage].question}</h3>
            </div>
          </div>

          <div className="p-8 bg-slate-950/50 border border-white/5 rounded-3xl min-h-[150px] flex flex-col items-center justify-center text-center relative group/input">
             {transcript ? (
               <p className="text-slate-200 text-lg font-medium leading-relaxed italic">"{transcript}"</p>
             ) : (
               <div className="space-y-4 opacity-30 group-hover/input:opacity-50 transition-all">
                 <Mic className="w-8 h-8 mx-auto text-slate-500" />
                 <p className="text-xs uppercase font-black tracking-widest text-slate-400">Awaiting Professional Input</p>
               </div>
             )}
             
             {isRecording && (
               <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 rounded-3xl">
                  <div className="flex gap-1.5 items-end h-8">
                     {[...Array(5)].map((_, i) => (
                       <div 
                         key={i} 
                         className="w-1 bg-blue-500 rounded-full animate-wave" 
                         style={{ animationDelay: `${i * 0.1}s`, height: i % 2 === 0 ? '60%' : '100%' }} 
                       />
                     ))}
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 relative z-10">
           <div className="flex items-center gap-6">
              <button 
                onClick={handleToggleRecording}
                disabled={isSynthesizing || isGeneratingResume}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-pulse' : 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:scale-110 active:scale-95'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              
              <button 
                onClick={nextStep}
                disabled={!transcript || isGeneratingResume}
                className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-20"
              >
                 <Send className="w-6 h-6" />
              </button>
           </div>
           
           <div className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em]">
             {isGeneratingResume ? 'ARCHITECTURE UNDERWAY' : 'Ready for Telemetry'}
           </div>
        </div>
      </div>
    </div>
  );
}
