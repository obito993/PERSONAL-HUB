'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, ChevronRight } from 'lucide-react';

interface AIAssistantGuideProps {
  initialMessage?: string;
  tips?: string[];
}

export function AIAssistantGuide({
  initialMessage = "Hello! I'm Forge AI, your career copilot. Ready to analyze or tailor your resume?",
  tips = [
    'Confirm missing skills in Skill Gap to let AI tailor them safely.',
    'Use Master Profile to maintain permanent career records.',
    'Check ATS Scanner before sending applications to recruiters.',
  ],
}: AIAssistantGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % tips.length);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 no-print">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-3 w-80 rounded-xl border-2 border-orange-500/80 bg-[#0d0d12]/95 p-4 shadow-[0_0_30px_rgba(249,115,22,0.3)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-orange-500/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-black">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-black tracking-wider text-orange-400 uppercase">
                  FORGE AI GUIDE
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2.5 text-xs text-zinc-300 leading-relaxed font-medium">
              {tips[tipIndex] || initialMessage}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2">
              <button
                onClick={nextTip}
                className="flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:underline"
              >
                <span>Next Insight</span>
                <ChevronRight className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-zinc-500 uppercase font-mono">
                TIP {tipIndex + 1}/{tips.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Assistant Orb Trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        data-cursor="ASK AI"
        className="relative flex h-13 w-13 items-center justify-center rounded-full border-2 border-orange-500 bg-[#09090b] text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:bg-orange-500 hover:text-black transition-colors"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-500">
          <span className="h-2 w-2 rounded-full bg-black" />
        </span>
      </motion.button>
    </div>
  );
}
