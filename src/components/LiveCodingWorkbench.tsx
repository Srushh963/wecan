import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Play, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, Terminal, ArrowRight } from 'lucide-react';
import { getGroqChatCompletionJson, GROQ_MODEL } from '../lib/groq';

interface CodeChallenge {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  starterCode: string;
}

export default function LiveCodingWorkbench() {
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [topic, setTopic] = useState('Arrays & Hash Maps');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [challenge, setChallenge] = useState<CodeChallenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const fetchProblem = async () => {
    setIsGenerating(true);
    setChallenge(null);
    setFeedback(null);
    try {
      const data = await getGroqChatCompletionJson<CodeChallenge>(
        [
          {
            role: 'system',
            content: `You are a Technical Interviewer at a top tier software firm. Generate a realistic coding interview challenge for students.
Language requested: ${language}.
Topic: ${topic}.
Difficulty: ${difficulty}.

You MUST return a JSON object with this exact schema:
{
  "title": "string",
  "difficulty": "Easy" | "Medium" | "Hard",
  "description": "string",
  "examples": [
    { "input": "string", "output": "string", "explanation": "string" }
  ],
  "starterCode": "string"
}`
          },
          {
            role: 'user',
            content: `Generate a fresh coding interview problem in ${language} on ${topic} at ${difficulty} level.`
          }
        ],
        GROQ_MODEL
      );

      setChallenge(data);
      setUserCode(data.starterCode || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewCode = async () => {
    if (!challenge || !userCode) return;
    setIsEvaluating(true);
    try {
      const evaluation = await getGroqChatCompletionJson(
        [
          {
            role: 'system',
            content: `You are a Senior Staff Engineer reviewing a candidate's code submission in an interview.
Problem Title: ${challenge.title}
Problem Description: ${challenge.description}

Analyze the candidate's code for:
1. Correctness & Edge Cases
2. Time & Space Complexity (Big-O notation)
3. Code Cleanliness & Idiomatic patterns
4. Concrete suggestions for optimization

You MUST return a JSON object with this exact schema:
{
  "isCorrect": boolean,
  "score": number, // out of 100
  "timeComplexity": "string",
  "spaceComplexity": "string",
  "strengths": ["string"],
  "edgeCasesMissed": ["string"],
  "optimizedAlternative": "string"
}`
          },
          {
            role: 'user',
            content: `Candidate code in ${language}:\n\n${userCode}`
          }
        ],
        GROQ_MODEL
      );

      setFeedback(evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20 font-sans">
      <div className="border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.3em]">Technical Lab</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Live Coding Arena</h2>
          <p className="text-slate-500 text-sm font-medium">Practice realistic data structures & algorithms with instant AI code reviews.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={language}
            onChange={(e: any) => setLanguage(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
          >
            <option value="javascript">JavaScript / TypeScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>

          <select
            value={difficulty}
            onChange={(e: any) => setDifficulty(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={fetchProblem}
            disabled={isGenerating}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>New Challenge</span>
          </button>
        </div>
      </div>

      {!challenge ? (
        <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-16 text-center space-y-4">
          <Code2 className="w-16 h-16 text-blue-400 mx-auto opacity-30" />
          <h3 className="text-xl font-bold text-white">Ready to test your algorithms?</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Choose your language & difficulty above, then click <strong>New Challenge</strong> to receive an interview problem.
          </p>
          <button
            onClick={fetchProblem}
            disabled={isGenerating}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
          >
            Generate First Problem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Problem Statement */}
          <div className="lg:col-span-5 bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6 overflow-y-auto max-h-[680px]">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${
                challenge.difficulty === 'Easy'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : challenge.difficulty === 'Medium'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {challenge.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium">{language}</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Examples</span>
              {challenge.examples.map((ex, i) => (
                <div key={i} className="p-3.5 bg-slate-950 rounded-xl border border-white/5 font-mono text-xs space-y-1">
                  <div><span className="text-slate-500">Input:</span> <span className="text-blue-300">{ex.input}</span></div>
                  <div><span className="text-slate-500">Output:</span> <span className="text-emerald-300">{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="text-[11px] text-slate-400 font-sans mt-1 pt-1 border-t border-white/5">{ex.explanation}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor & Feedback */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 flex flex-col flex-1 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>solution.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : 'ts'}</span>
                </div>
                <button
                  onClick={handleReviewCode}
                  disabled={isEvaluating || !userCode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                >
                  {isEvaluating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>Run & Review Code</span>
                </button>
              </div>

              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-80 bg-slate-950 font-mono text-xs text-blue-200 p-4 rounded-2xl mt-4 focus:outline-none focus:border-blue-500 border border-white/5 resize-none leading-relaxed"
                placeholder="// Write your solution here..."
                spellCheck={false}
              />
            </div>

            {/* Evaluation Results */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                        feedback.isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {feedback.isCorrect ? 'Accepted' : 'Needs Optimization'}
                      </span>
                      <span className="text-xl font-black text-white">{feedback.score}/100</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span>Time: <strong className="text-blue-400">{feedback.timeComplexity}</strong></span>
                      <span>Space: <strong className="text-blue-400">{feedback.spaceComplexity}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {feedback.strengths && feedback.strengths.length > 0 && (
                      <div className="space-y-1.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                        </span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {feedback.strengths.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feedback.edgeCasesMissed && feedback.edgeCasesMissed.length > 0 && (
                      <div className="space-y-1.5 p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                        <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase text-[10px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Edge Cases To Handle
                        </span>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {feedback.edgeCasesMissed.map((ec: string, i: number) => (
                            <li key={i}>{ec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {feedback.optimizedAlternative && (
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-white/5 space-y-1.5">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5 uppercase text-[10px]">
                        <Lightbulb className="w-3.5 h-3.5" /> Optimal Pattern / Hints
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{feedback.optimizedAlternative}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
