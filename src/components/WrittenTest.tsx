import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldQuestion, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';
import { saveTestResult } from '../lib/db';

export default function WrittenTest() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const startTest = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setAnswers({});
    setShowResults(false);
    try {
      const data = await getGroqChatCompletionJson(
        [
          {
            role: 'system',
            content: `You are an Elite Technical Examiner. Generate 5 highly challenging multiple-choice questions for the specified topic. Focus on edge cases and deep architectural patterns.
You MUST reply with a JSON object containing a "questions" array in this exact schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Topic: ${topic}`
          }
        ],
        GROQ_MODEL
      );

      const parsedQuestions = Array.isArray(data) ? data : (data?.questions || []);
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitTest = async () => {
    setShowResults(true);
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    
    const finalScore = (score / questions.length) * 100;
    setEvaluation({ score: finalScore });

    await saveTestResult({
      topic,
      score: finalScore
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Technical Written Assessments</h2>
          <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Adversarial Domain Evaluation</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            value={topic} onChange={e => setTopic(e.target.value)}
            className="flex-1 md:w-64 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
            placeholder="Topic (e.g. Kubernetes, React Hooks)"
          />
          <button 
            onClick={startTest}
            disabled={isGenerating || !topic}
            className="py-3 px-8 bg-blue-600 border border-blue-500 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {isGenerating ? 'Synthesizing...' : 'Initialize Test'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {questions.map((q, i) => (
              <div key={i} className={`p-8 bg-slate-900 border border-white/5 rounded-3xl transition-all ${showResults ? 'pointer-events-none' : ''}`}>
                 <div className="flex gap-4 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                       {i + 1}
                    </div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{q.question}</h4>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt: string, j: number) => {
                      const isSelected = answers[i] === opt;
                      const isCorrect = opt === q.correctAnswer;
                      const showCorrect = showResults && isCorrect;
                      const showWrong = showResults && isSelected && !isCorrect;

                      return (
                        <button
                          key={j}
                          onClick={() => setAnswers({...answers, [i]: opt})}
                          className={`p-4 rounded-xl border text-sm font-medium transition-all text-left flex justify-between items-center ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                          } ${showCorrect ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : ''} ${showWrong ? 'bg-rose-500/20 border-rose-500 text-rose-400' : ''}`}
                        >
                          {opt}
                          {showCorrect && <CheckCircle2 className="w-4 h-4" />}
                          {showWrong && <XCircle className="w-4 h-4" />}
                        </button>
                      );
                    })}
                 </div>

                 {showResults && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Deep Logic Explanation</p>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{q.explanation}</p>
                   </motion.div>
                 )}
              </div>
            ))}

            {!showResults ? (
              <button 
                onClick={submitTest}
                disabled={Object.keys(answers).length < 5}
                className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl disabled:opacity-20"
              >
                Complete Submission
              </button>
            ) : (
              <div className="p-10 bg-slate-900 border border-white/5 rounded-[2rem] text-center space-y-4">
                 <div className="text-6xl font-black text-white tracking-tighter shimmer">{evaluation.score}%</div>
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.4em]">Test Integrity Result</p>
                 <button 
                   onClick={() => setQuestions([])}
                   className="px-8 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-blue-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white/[0.05] transition-all"
                 >
                   Return to Terminal
                 </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!questions.length && !isGenerating && (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/5 bg-slate-900/50 rounded-[3rem] opacity-30">
           <Terminal className="w-16 h-16 mb-4 text-slate-600" />
           <p className="text-sm uppercase font-black tracking-widest text-slate-500">Awaiting Simulation Initialization</p>
        </div>
      )}
    </div>
  );
}
