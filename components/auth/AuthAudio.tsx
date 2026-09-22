'use client';

import React, { useState, useEffect, useRef } from 'react';

export function AuthAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Single shared audio instance
    const audio = new Audio('/audio/theme.mp3');
    audio.loop = true;
    audio.volume = 0.25; // Subtle background volume (25%)
    audioRef.current = audio;

    // Check user preference
    const savedState = localStorage.getItem('dh_auth_audio_muted');
    const userWantsMute = savedState === 'true';

    if (!userWantsMute) {
      // Attempt autoplay
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browser blocked autoplay — keep button visible as muted 🔇
          setIsPlaying(false);
        });
    } else {
      setIsPlaying(false);
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      localStorage.setItem('dh_auth_audio_muted', 'true');
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem('dh_auth_audio_muted', 'false');
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Turn music off' : 'Turn music on'}
        className="bg-[#FFFDF5] hover:bg-white text-black border-3 border-black shadow-comic-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 cursor-pointer"
      >
        <span>{isPlaying ? '🔊' : '🔇'}</span>
      </button>
    </div>
  );
}
