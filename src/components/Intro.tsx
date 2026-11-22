import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { stopAllSpeechAndAudio } from '../lib/soundManager';

interface IntroProps {
  onComplete: () => void;
}

export default function Intro({ onComplete }: IntroProps) {
  const [phase, setPhase] = useState<'invoked' | 'manifested' | 'dissolved'>('invoked');

  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      x: ((i * 17) % 100) + '%',
      y: ((i * 23) % 100) + '%',
      duration: (i % 5) + 5,
      delay: (i % 3)
    }));
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const sequence = async () => {
      // Ensure previous audio is fully stopped
      stopAllSpeechAndAudio();

      // 1. VOID PHASE
      await new Promise(r => setTimeout(r, 800));
      if (isCancelled) return;
      
      // 2. INVOCATION - Speak line exactly once, wait until finished or completed
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("YOU ARE CAPABLE. STEP INTO THE VAULT. YOUR EVOLUTION BEGINS NOW.");
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.onend = () => {
          stopAllSpeechAndAudio();
        };
        utterance.onerror = () => {
          stopAllSpeechAndAudio();
        };
        window.speechSynthesis.speak(utterance);
      }
      
      setPhase('manifested');
      await new Promise(r => setTimeout(r, 4000));
      if (isCancelled) return;

      // Stop voice immediately once the line is spoken and phase transitions
      stopAllSpeechAndAudio();

      setPhase('dissolved');
      await new Promise(r => setTimeout(r, 1200));
      if (isCancelled) return;

      // Final cutoff before passing control to next screen
      stopAllSpeechAndAudio();
      onComplete();
    };

    sequence();

    return () => {
      isCancelled = true;
      stopAllSpeechAndAudio();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-8 overflow-hidden">
      <AnimatePresence>
        {phase === 'manifested' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(40px)' }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-center relative"
          >
            {/* Monolith Reflection */}
            <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-white/5 to-transparent blur-3xl rounded-full" />
            
            <h1 className="text-8xl md:text-9xl font-serif tracking-[0.2em] cinematic-glow shimmer select-none">
              WECAN
            </h1>
            <h2 className="text-4xl md:text-5xl font-serif mt-8 opacity-40 tracking-[0.5em] select-none">
              योग्यता
            </h2>

            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, delay: 1 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mt-12 mx-auto max-w-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atmospheric particulate effect */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            initial={{ 
              x: p.x, 
              y: p.y,
              opacity: 0 
            }}
            animate={{ 
              y: [null, '-20%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity,
              delay: p.delay 
            }}
          />
        ))}
      </div>
    </div>
  );
}
