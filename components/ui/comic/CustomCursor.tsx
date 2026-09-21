'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch desktop screens
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check hovered element context
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const hoverable = target.closest('[data-cursor], button, a, input, select, textarea');
      if (hoverable) {
        setIsHovered(true);
        const tag = hoverable.getAttribute('data-cursor');
        if (tag) {
          setCursorText(tag);
        } else if (hoverable.tagName === 'BUTTON' || hoverable.tagName === 'A') {
          setCursorText('OPEN');
        } else {
          setCursorText('');
        }
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden no-print">
      {/* Outer Glowing Ring */}
      <motion.div
        className="fixed rounded-full border border-orange-500/80 bg-orange-500/10 backdrop-blur-[1px]"
        animate={{
          x: mousePos.x - (isHovered ? 24 : 12),
          y: mousePos.y - (isHovered ? 24 : 12),
          width: isHovered ? 48 : 24,
          height: isHovered ? 48 : 24,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.1 }}
      />

      {/* Inner Glowing Center Core */}
      <motion.div
        className="fixed h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 500 }}
      />

      {/* Context Action Badge */}
      <AnimatePresence>
        {cursorText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="fixed z-50 rounded bg-orange-500 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-black shadow-lg uppercase"
            style={{
              left: mousePos.x + 16,
              top: mousePos.y + 16,
            }}
          >
            {cursorText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
