'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { sound } from '@/lib/sound';

export default function FocusPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [taskTitle, setTaskTitle] = useState('STUDY SQL & FRONTEND');
  const [ambientType, setAmbientType] = useState<'off' | 'rain' | 'cafe' | 'forest'>('off');
  const [ambientAudio, setAmbientAudio] = useState<ReturnType<typeof sound.createAmbientSound> | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          sound.playTimerEnd();
          alert('🎉 FOCUS SPRINT COMPLETED! TAKE A BREAK!');
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    sound.playPop();
  };

  const resetTimer = (m = 25) => {
    setIsActive(false);
    setMinutes(m);
    setSeconds(0);
    sound.playPop();
  };

  const handleSoundChange = (type: 'off' | 'rain' | 'cafe' | 'forest') => {
    if (ambientAudio) {
      ambientAudio.stop();
    }

    if (type === 'off') {
      setAmbientType('off');
      setAmbientAudio(null);
    } else {
      const newSound = sound.createAmbientSound(type === 'forest' ? 'forest' : type === 'rain' ? 'rain' : 'cafe');
      if (newSound) {
        newSound.start();
        setAmbientAudio(newSound);
      }
      setAmbientType(type);
    }
    sound.playPop();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 shadow-comic flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-xs font-black hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO HUB</span>
          </Link>
          <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight flex items-center gap-2">
            <Timer className="w-8 h-8 text-[#FF5A5F]" />
            <span>THE FOCUS ROOM</span>
          </h1>
        </div>
        <span className="comic-sticker comic-sticker-red text-xs hidden sm:inline">
          CALM MODE
        </span>
      </div>

      {/* Main Focus Card */}
      <div className="comic-card-cream p-8 sm:p-12 text-center space-y-8">
        
        {/* Task Target */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-black uppercase text-gray-600">CURRENT TARGET MISSION</span>
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="comic-input text-center text-lg sm:text-2xl font-black max-w-md mx-auto"
          />
        </div>

        {/* Large Timer Display */}
        <div className="font-mono font-black text-6xl sm:text-9xl tracking-tighter text-black py-4 bg-white comic-border-lg shadow-comic inline-block px-8 sm:px-16">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`btn-comic text-base px-8 py-4 flex items-center gap-2 ${
              isActive ? 'btn-comic-red' : 'btn-comic-yellow'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-black" />}
            <span>{isActive ? 'PAUSE SPRINT' : 'START FOCUS'}</span>
          </button>

          <button
            onClick={() => resetTimer(25)}
            className="btn-comic btn-comic-white p-4"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Sprint Duration Presets */}
        <div className="flex justify-center gap-2 pt-4">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => resetTimer(m)}
              className={`btn-comic text-xs px-3 py-1.5 ${
                minutes === m && seconds === 0 ? 'btn-comic-purple font-black' : 'btn-comic-white'
              }`}
            >
              {m} MIN
            </button>
          ))}
        </div>

        {/* Synthesized Ambient Audio Soundscapes */}
        <div className="pt-6 border-t-2 border-black max-w-md mx-auto space-y-2">
          <div className="text-xs font-black uppercase text-gray-700">SYNTHESIZED AMBIENT SOUNDSCAPES</div>
          <div className="flex justify-center gap-2">
            {[
              { id: 'off', label: 'OFF' },
              { id: 'rain', label: '🌧 RAIN' },
              { id: 'cafe', label: '☕ CAFE' },
              { id: 'forest', label: '🌲 FOREST' },
            ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleSoundChange(snd.id as typeof ambientType)}
                className={`btn-comic text-xs px-3 py-1 ${
                  ambientType === snd.id ? 'btn-comic-yellow font-black' : 'btn-comic-white'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
