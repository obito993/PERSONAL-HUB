'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Trash2, Volume2, VolumeX, Shield, Check } from 'lucide-react';
import { storage, UserState } from '@/lib/storage';
import { sound } from '@/lib/sound';

export default function SettingsPage() {
  const [userState, setUserState] = useState<UserState | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    setUserState(storage.getUserState());
  }, []);

  const handleToggleSound = () => {
    if (!userState) return;
    const updated = storage.saveUserState({ soundEnabled: !userState.soundEnabled });
    setUserState(updated);
    if (updated.soundEnabled) sound.playPop();
  };

  const handleClearData = () => {
    storage.clearAllData();
    setUserState(storage.getUserState());
    setShowConfirmReset(false);
    sound.playPop();
    alert('DEION HUB local storage has been reset to defaults.');
    window.location.href = '/';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-yellow">
            CONFIGURATION
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          <span>SETTINGS</span>
        </h1>
      </div>

      {/* Settings Form */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-6">
        
        {/* Sound Toggle */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div>
            <div className="font-black text-base uppercase">Audio & Sound Effects</div>
            <div className="text-xs text-gray-600 font-bold">Synthesized Web Audio clicks, pops, and timer bells</div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`btn-comic text-xs px-4 py-2 ${userState?.soundEnabled ? 'btn-comic-yellow font-black' : 'btn-comic-white'}`}
          >
            {userState?.soundEnabled ? 'AUDIO ENABLED' : 'AUDIO MUTED'}
          </button>
        </div>

        {/* Local Storage Reset */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="font-black text-base uppercase text-[#FF5A5F]">Reset Deion Hub</div>
            <div className="text-xs text-gray-600 font-bold">Clear all local storage data, tasks, habits, and restore defaults</div>
          </div>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="btn-comic btn-comic-red text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>RESET DATA</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleClearData} className="btn-comic btn-comic-red text-xs px-3 py-2 font-black">
                CONFIRM RESET
              </button>
              <button onClick={() => setShowConfirmReset(false)} className="btn-comic btn-comic-white text-xs px-2 py-2">
                CANCEL
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
