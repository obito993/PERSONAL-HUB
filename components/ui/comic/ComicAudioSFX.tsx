'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function ComicAudioSFX() {
  const [muted, setMuted] = useState(true);

  const playSynthBeep = (freq = 440, duration = 0.08) => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext blocked before user interaction
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, select')) {
        playSynthBeep(650, 0.06);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [muted]);

  return (
    <button
      onClick={() => setMuted(!muted)}
      data-cursor="SOUND"
      className="fixed bottom-6 left-6 z-40 flex h-10 items-center gap-2 rounded-full border-2 border-orange-500/50 bg-[#09090b] px-3 font-mono text-[11px] font-bold text-orange-400 uppercase shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:bg-orange-500 hover:text-black transition-colors no-print"
      title={muted ? 'Enable SFX' : 'Mute SFX'}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />}
      <span>SFX: {muted ? 'OFF' : 'ON'}</span>
    </button>
  );
}
