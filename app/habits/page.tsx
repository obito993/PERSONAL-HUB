'use client';

import React, { useState } from 'react';
import { Flame, Check, Plus, Trophy } from 'lucide-react';
import { storage, HabitItem } from '@/lib/storage';
import { sound } from '@/lib/sound';

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitItem[]>(storage.getHabits());
  const [newTitle, setNewTitle] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleToggleHabit = (id: string) => {
    const updated = storage.toggleHabitToday(id);
    setHabits(updated);
    sound.playPop();
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const list = storage.getHabits();
    const newH: HabitItem = {
      id: 'h_' + Date.now(),
      title: newTitle,
      category: 'GENERAL',
      streak: 0,
      bestStreak: 0,
      history: [],
    };
    const updated = [...list, newH];
    storage.saveHabits(updated);
    setHabits(updated);
    setNewTitle('');
    sound.playPop();
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-red">
            STREAK BOARD
          </span>
          <span className="text-xs font-mono font-bold bg-[#FFD83D] comic-border-sm px-2 py-0.5">
            DAILY HABITS
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight">
          THE STREAK
        </h1>

        <p className="font-extrabold text-gray-700 text-sm sm:text-base">
          Build consistency, maintain daily streaks, and earn XP every day.
        </p>
      </div>

      {/* Add Habit Form */}
      <div className="comic-card p-6 space-y-4">
        <h2 className="font-black text-lg border-b-2 border-black pb-2 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#FF5A5F]" />
          <span>BUILD A NEW HABIT</span>
        </h2>

        <form onSubmit={handleAddHabit} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Habit title (e.g. 15m Daily Coding, Read Tech Docs)..."
            className="comic-input text-xs flex-1"
          />
          <button type="submit" className="btn-comic btn-comic-red px-6 text-xs">
            ADD HABIT
          </button>
        </form>
      </div>

      {/* Habits List & Streak Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((h) => {
          const isDoneToday = h.history.includes(today);
          return (
            <div key={h.id} className="comic-card p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="comic-sticker comic-sticker-yellow text-[10px]">
                    {h.category}
                  </span>
                  <div className="flex items-center gap-1 font-mono font-black text-xs text-[#FF5A5F]">
                    <Flame className="w-4 h-4 fill-[#FF5A5F]" />
                    <span>{h.streak} STREAK</span>
                  </div>
                </div>

                <h3 className="font-black text-lg">{h.title}</h3>
                <div className="text-xs font-mono text-gray-600">Best Streak: {h.bestStreak} days</div>
              </div>

              {/* Comic Contribution Grid */}
              <div className="pt-2 border-t-2 border-black space-y-3">
                <div className="text-[10px] font-mono font-bold text-gray-500 uppercase">ACTIVITY LOG</div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 comic-border-sm flex items-center justify-center text-[9px] font-mono font-bold ${
                        i === 13 && isDoneToday ? 'bg-[#FF5A5F] text-white' : i < h.streak ? 'bg-[#FFD83D]' : 'bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleToggleHabit(h.id)}
                  className={`btn-comic w-full py-2 text-xs flex items-center justify-center gap-2 ${
                    isDoneToday ? 'btn-comic-purple font-black' : 'btn-comic-yellow'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isDoneToday ? 'COMPLETED TODAY (+15 XP)' : 'MARK COMPLETED TODAY'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
