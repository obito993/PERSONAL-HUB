'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ComicActionBadgeProps {
  text: string; // e.g. "BOOM!", "ZAP!", "TAILORED!", "MATCH 95%!"
  variant?: 'orange' | 'yellow' | 'red' | 'emerald';
  rotate?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ComicActionBadge({
  text,
  variant = 'orange',
  rotate = -6,
  size = 'md',
  className = '',
}: ComicActionBadgeProps) {
  const bgStyles = {
    orange: 'bg-orange-500 text-black border-2 border-black shadow-[3px_3px_0px_#000]',
    yellow: 'bg-amber-300 text-black border-2 border-black shadow-[3px_3px_0px_#000]',
    red: 'bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_#000]',
    emerald: 'bg-emerald-400 text-black border-2 border-black shadow-[3px_3px_0px_#000]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: rotate + 4 }}
      style={{ rotate: `${rotate}deg` }}
      className={`inline-block rounded font-black tracking-widest uppercase animate-comic-pop ${bgStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      💥 {text}
    </motion.div>
  );
}
