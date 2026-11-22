import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getInterviewResponse, generateSpeech, getDetailedVoiceFeedback } from '../lib/groq';
import { Mic, MicOff, Activity, ShieldCheck, Zap, Volume2, Maximize2, Download } from 'lucide-react';
import { saveInterviewSession } from '../lib/db';
import { downloadStyledPDF } from '../lib/pdfExport';
import { playAudioOrSpeech, stopAllSpeechAndAudio } from '../lib/soundManager';

interface VaultSimulatorProps {
  mode?: 'technical' | 'behavioral' | 'voice';
}

export default function VaultSimulator({ mode = 'technical' }: VaultSimulatorProps) {
  const [messages, setMessages] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [evaluation, setEvaluation] = useState<{ 
    overview: string, 
    score: number,
    voiceMetrics?: {
      pronunciation: number;
      pace: number;
      clarity: number;
      content: number;
      tips: string[];
      pronunciationExamples?: string[];
    }
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const downloadInterviewReport = async () => {
    if (!evaluation) return;
    const reportHtml = `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">Adversarial Mock Interview Diagnostic Report</h2>
        <p style="color: #64748b; font-size: 12px; margin-top: 0;">Evaluation Mode: ${mode.toUpperCase()} • STAR Method Assessment</p>
      </div>

      <!-- Score Card -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Overall Interview Score</div>
          <div style="font-size: 13px; color: #334155; margin-top: 2px;">Blended technical depth and communication score</div>
        </div>
        <div style="font-size: 38px; font-weight: 900; color: #2563eb;">${evaluation.score}/100</div>
      </div>

      <!-- Voice & Delivery Breakdown -->
      ${evaluation.voiceMetrics ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">
            Speech & Communication Metrics
          </h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Pronunciation</div>
              <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 4px;">${evaluation.voiceMetrics.pronunciation}%</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Pace</div>
              <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 4px;">${evaluation.voiceMetrics.pace}%</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Clarity</div>
              <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 4px;">${evaluation.voiceMetrics.clarity}%</div>
            </div>
            <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
              <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Content Depth</div>
              <div style="font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 4px;">${evaluation.voiceMetrics.content}%</div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Detailed Feedback -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 13px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">
          Interviewer Synthesis & Review
        </h3>
        <div style="font-size: 12px; color: #334155; line-height: 1.6; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; white-space: pre-wrap;">
          ${evaluation.overview}
        </div>
      </div>

      <!-- Actionable Coaching Tips -->
      ${evaluation.voiceMetrics?.tips && evaluation.voiceMetrics.tips.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 13px; font-weight: 700; color: #16a34a; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">
            Coaching Recommendations
          </h3>
          <ul style="margin: 0; padding-left: 18px; color: #334155; font-size: 12px; line-height: 1.6;">
            ${evaluation.voiceMetrics.tips.map((t: string) => `
              <li style="margin-bottom: 6px;">${t}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    await downloadStyledPDF(reportHtml, `Interview_Report_${mode}_${Date.now()}.pdf`);
  };

  const startInitiation = async () => {
    setSessionActive(true);
    setIsThinking(true);
    setQuestionCount(1);
    const newId = `int_${Date.now()}`;
    setSessionId(newId);
    
    let prompt = "";
    if (mode === 'behavioral') {
      prompt = "You are an expert HR behavioral interviewer. Focus on soft skills, leadership, and conflict resolution. Ask exactly one behavioral question using the STAR method format.";
    } else if (mode === 'voice') {
      prompt = "You are an elite voice-first interviewer. Keep questions concise and punchy. Ask one technical question about system design or architecture.";
    } else {
      prompt = "You are a lead technical interviewer. Probe deeply into technical fundamentals and problem solving. Ask exactly one technical engineering question.";
    }

    const response = await getInterviewResponse([], prompt);
    setMessages([{ role: 'model', parts: [{ text: response }] }]);
    setIsThinking(false);
    if (mode === 'voice') speak(response);
  };

  // Clean up any ongoing audio when navigating away from the interview
  useEffect(() => {
    return () => {
      stopAllSpeechAndAudio();
    };
  }, []);

  const speak = async (text: string) => {
    const audioUrl = await generateSpeech(text);
    playAudioOrSpeech(audioUrl, text);
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserInput(transcript);
          setIsRecording(false);
        };
        recognition.start();
        setIsRecording(true);
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!userInput) return;
    const newMessages = [...messages, { role: 'user', parts: [{ text: userInput }] }];
    setMessages(newMessages);
    setUserInput('');
    setIsThinking(true);

    if (questionCount >= 5) {
      // Final Evaluation
      const summaryPrompt = "The interview is over. Analyze the candidate's performance across all answers. Provide a score out of 100, strength points, and improvement areas.";
      const finishResponse = await getInterviewResponse(newMessages, summaryPrompt);
      const voiceFeedback = await getDetailedVoiceFeedback(newMessages);
      
      const sessionScore = Math.round((78 + voiceFeedback.content) / 2); // Blended score
      
      setEvaluation({ 
        overview: finishResponse, 
        score: sessionScore,
        voiceMetrics: {
          pronunciation: voiceFeedback.pronunciation,
          pace: voiceFeedback.pace,
          clarity: voiceFeedback.clarity,
          content: voiceFeedback.content,
          tips: voiceFeedback.tips || [],
          pronunciationExamples: voiceFeedback.pronunciationExamples || []
        }
      });
      setIsThinking(false);
      speak("Atmosphere stabilization complete. Reviewing your trajectory results.");

      if (sessionId) {
        await saveInterviewSession({
          sessionId,
          mode,
          history: newMessages,
          feedback: finishResponse,
          voiceMetrics: voiceFeedback,
          score: sessionScore
        });
      }
      return;
    }

    try {
      const nextPrompt = "Analyze the previous answer briefly (internal logic) and then ask the NEXT technical follow-up question. Be adversarial.";
      const response = await getInterviewResponse(newMessages, nextPrompt);
      setMessages([...newMessages, { role: 'model', parts: [{ text: response }] }]);
      setQuestionCount(prev => prev + 1);
      speak(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col h-[600px] border border-white/5 bg-slate-900 shadow-2xl rounded-2xl overflow-hidden glass-panel">
      {!sessionActive ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md px-10 text-center">
          <h4 className="text-3xl font-bold text-white tracking-tight mb-4">
            {mode === 'technical' ? 'Technical Proficiency Lab' : 
             mode === 'behavioral' ? 'Behavioral Strategy Lab' : 
             'Voice-Enhanced Simulation'}
          </h4>
          <p className="text-slate-400 text-sm max-w-sm mb-8">
            {mode === 'voice' ? 
              'Hone your communication clarity and precision with our voice-first AI adversarial model.' :
              'Practice high-stakes interview scenarios to refine your professional presence and domain knowledge.'}
          </p>
          <button
            onClick={startInitiation}
            className="px-12 py-4 bg-blue-600 border border-blue-500 rounded-xl font-bold text-white uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg profession-glow"
          >
            Start Session
          </button>
        </div>
      ) : (
        <>
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-blue-400" />
              <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Live Simulation Protocol</h4>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[9px] text-blue-400 font-bold uppercase">Audio/Text Link Active</span>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-slate-950/20 text-sans">
            <AnimatePresence>
              {evaluation ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-12">
                   <div className="text-6xl font-bold text-blue-400 tracking-tighter shimmer">{evaluation.score}</div>
                   <p className="text-[10px] uppercase text-slate-500 tracking-[0.4em] font-bold">Session Evaluation Score</p>
                   
                   {evaluation.voiceMetrics && (
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto px-4">
                        {[
                          { label: 'Pronunciation', val: evaluation.voiceMetrics.pronunciation, icon: Volume2 },
                          { label: 'Pace', val: evaluation.voiceMetrics.pace, icon: Zap },
                          { label: 'Clarity', val: evaluation.voiceMetrics.clarity, icon: Maximize2 },
                          { label: 'Content', val: evaluation.voiceMetrics.content, icon: ShieldCheck }
                        ].map((m, i) => (
                          <div key={i} className="p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                             <m.icon className="w-4 h-4 text-blue-400 mx-auto mb-2" />
                             <p className="text-[8px] uppercase font-bold text-slate-500 mb-1">{m.label}</p>
                             <p className="text-xl font-bold text-white">{m.val}%</p>
                          </div>
                        ))}
                     </div>
                   )}

                   <div className="max-w-xl mx-auto p-8 bg-slate-900 border border-white/5 rounded-2xl text-left text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      <p className="text-[10px] uppercase text-blue-400 font-bold mb-4 tracking-widest">Adversarial Synthesis</p>
                      {evaluation.overview}
                      {evaluation.voiceMetrics?.pronunciationExamples && evaluation.voiceMetrics.pronunciationExamples.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                           <p className="text-[10px] uppercase text-amber-400 font-bold mb-3 tracking-widest">Pronunciation Watchlist</p>
                           <div className="flex flex-wrap gap-2">
                             {evaluation.voiceMetrics.pronunciationExamples.map((word, i) => (
                               <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 font-bold italic">
                                 "{word}"
                               </span>
                             ))}
                           </div>
                        </div>
                      )}
                      {evaluation.voiceMetrics?.tips && evaluation.voiceMetrics.tips.length > 0 && (
                         <div className="mt-6 pt-6 border-t border-white/5">
                            <p className="text-[10px] uppercase text-emerald-400 font-bold mb-3 tracking-widest">Communication Coaching</p>
                            <ul className="space-y-2">
                               {evaluation.voiceMetrics.tips.map((tip, i) => (
                                 <li key={i} className="flex gap-2 text-xs text-slate-400">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                    {tip}
                                 </li>
                               ))}
                            </ul>
                         </div>
                      )}
                   </div>
                   <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={downloadInterviewReport}
                        className="px-6 py-3 bg-blue-600 border border-blue-500 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <Download className="w-4 h-4" />
                        Download Evaluation Report (PDF)
                      </button>
                      <button 
                        onClick={() => { setSessionActive(false); setEvaluation(null); setMessages([]); }}
                        className="px-6 py-3 bg-slate-800 border border-white/10 rounded-xl text-slate-300 font-bold uppercase text-xs tracking-widest hover:bg-slate-700 transition-all"
                      >
                        Restart Laboratory
                      </button>
                   </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-slate-800 border border-white/5 text-slate-200'
                      }`}>
                        {m.parts[0].text}
                      </div>
                    </motion.div>
                  ))}
                  {isThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 p-4 bg-slate-800/50 rounded-xl w-fit">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {!evaluation && (
            <div className="p-8 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your professional response..."
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                />
                <button
                  onClick={handleVoiceToggle}
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    isRecording ? 'bg-blue-600 text-white shadow-lg profession-glow' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 shadow-sm" />}
                </button>
              </div>
              
              <div className="mt-4 flex justify-between items-center px-2">
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    Input: {isRecording ? 'Capturing Audio...' : 'Awaiting Metadata'}
                 </div>
                 <div className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">
                    Progress: {questionCount} / 5
                 </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>

  );
}
