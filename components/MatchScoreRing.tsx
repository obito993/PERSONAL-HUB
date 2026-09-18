'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CategoryScores } from '@/types';
import { CheckCircle2, Info } from 'lucide-react';

interface MatchScoreRingProps {
  score: number;
  categoryScores?: CategoryScores;
  size?: number;
}

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({ score, categoryScores, size = 200 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 stroke-emerald-500';
    if (val >= 60) return 'text-orange-400 stroke-orange-500';
    return 'text-rose-400 stroke-rose-500';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Animated Circular Progress */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={getScoreColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-5xl font-extrabold tracking-tight text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {score}%
          </motion.span>
          <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase mt-1">
            Job Match
          </span>
        </div>
      </div>

      {/* Sub-scores Breakdown */}
      {categoryScores && (
        <div className="w-full max-w-md mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: 'Skills', val: categoryScores.skills },
            { label: 'Keywords', val: categoryScores.keywords },
            { label: 'Experience', val: categoryScores.experience },
            { label: 'Education', val: categoryScores.education },
            { label: 'Responsibilities', val: categoryScores.responsibilities },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl text-center shadow-inner"
            >
              <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                {item.label}
              </div>
              <div className="text-base font-bold text-white mt-0.5">{item.val}%</div>
            </div>
          ))}
        </div>
      )}

      {/* Transparent Explanation Disclaimer Notice */}
      <div className="mt-5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 max-w-xl text-xs text-zinc-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          This is an internal compatibility indicator based on the information detected in your resume and job description. It is not a guarantee of interview selection or a universal ATS score.
        </p>
      </div>
    </div>
  );
};
