'use client';

import React, { useState, useEffect, useRef } from 'react';

export function GlobalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Shared global audio instance
    const audio = new Audio('/audio/theme.mp3');
    audio.loop = true;
    audio.volume = 0.25; // Subtle 25% background volume
    audioRef.current = audio;

    // Check user mute preference (default: unmuted)
    const savedMute = localStorage.getItem('dh_audio_muted');
    const userMuted = savedMute === 'true';

    if (!userMuted) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser restricts initial autoplay before user interaction
          setIsPlaying(false);
        });
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
      localStorage.setItem('dh_audio_muted', 'true');
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem('dh_audio_muted', 'false');
        })
        .catch(() => {});
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Turn music off' : 'Turn music on'}
        title={isPlaying ? 'Turn music off (🔊)' : 'Turn music on (🔇)'}
        className="bg-[#FFFDF5] hover:bg-white text-black border-3 border-black shadow-comic-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shrink-0 cursor-pointer"
      >
        <span>{isPlaying ? '🔊' : '🔇'}</span>
      </button>
    </div>
  );
}
