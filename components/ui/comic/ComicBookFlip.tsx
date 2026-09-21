'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComicBookFlipProps {
  children: React.ReactNode;
  chapterKey: string | number;
}

export function ComicBookFlip({ children, chapterKey }: ComicBookFlipProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chapterKey}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: 'left center' }}
        className="perspective-1000"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
