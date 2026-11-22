import React from 'react';
import { motion } from 'motion/react';

interface ChatMessagesListProps {
  messages: Array<{ role: string; parts: { text: string }[] }>;
  isThinking: boolean;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({ messages, isThinking }) => {
  return (
    <>
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 border border-white/5 text-slate-200'
            }`}
          >
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
  );
};
