'use client';

import React, { useState } from 'react';
import { Trophy, Zap, Check, ArrowRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { sound } from '@/lib/sound';

interface QuestItem {
  id: string;
  category: 'MATH' | 'LOGIC' | 'CODING' | 'PATTERN';
  question: string;
  options: string[];
  correctIndex: number;
  xpReward: number;
}

const DAILY_QUESTS: QuestItem[] = [
  {
    id: 'q1',
    category: 'MATH',
    question: 'What is 47 × 28?',
    options: ['1216', '1316', '1416', '1516'],
    correctIndex: 1,
    xpReward: 50,
  },
  {
    id: 'q2',
    category: 'LOGIC',
    question: 'If all A are B, and all B are C, which statement MUST be true?',
    options: ['All C are A', 'All A are C', 'Some C are not B', 'No A is C'],
    correctIndex: 1,
    xpReward: 50,
  },
  {
    id: 'q3',
    category: 'CODING',
    question: 'In JavaScript/TypeScript, what does Array.prototype.map() return?',
    options: ['Original mutated array', 'A new array with modified items', 'A single reduced value', 'Boolean'],
    correctIndex: 1,
    xpReward: 50,
  }
];

export default function ChallengesPage() {
  const [solved, setSolved] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const handleSelectOption = (quest: QuestItem, optionIndex: number) => {
    if (solved[quest.id] !== undefined) return;

    setSolved(prev => ({ ...prev, [quest.id]: optionIndex }));

    if (optionIndex === quest.correctIndex) {
      storage.addXP(quest.xpReward);
      setFeedback(prev => ({ ...prev, [quest.id]: `🎉 CORRECT! +${quest.xpReward} XP AWARDED!` }));
      sound.playLevelUp();
    } else {
      setFeedback(prev => ({ ...prev, [quest.id]: 'Almost! Try again on the next quest.' }));
      sound.playPop();
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex items-center gap-2">
          <span className="comic-sticker comic-sticker-yellow">
            DAILY QUEST
          </span>
          <span className="text-xs font-mono font-bold bg-[#FF5A5F] text-white comic-border-sm px-2 py-0.5">
            +50 XP PER QUEST
          </span>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight">
          THE DAILY QUEST
        </h1>

        <p className="font-extrabold text-gray-700 text-sm sm:text-base">
          Solve daily challenges in Math, Logic, and Coding to level up your Hero status.
        </p>
      </div>

      {/* Quests List */}
      <div className="space-y-6">
        {DAILY_QUESTS.map((q) => {
          const userSel = solved[q.id];
          const fb = feedback[q.id];
          return (
            <div key={q.id} className="comic-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="comic-sticker comic-sticker-purple text-xs font-mono">
                  {q.category}
                </span>
                <span className="bg-[#FFD83D] comic-border-sm text-xs font-mono font-black px-2 py-0.5">
                  +{q.xpReward} XP
                </span>
              </div>

              <h3 className="font-black text-lg sm:text-xl">{q.question}</h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, idx) => {
                  const isSelected = userSel === idx;
                  const isCorrect = idx === q.correctIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(q, idx)}
                      disabled={userSel !== undefined}
                      className={`p-3 text-xs font-bold text-left comic-border-sm transition-all flex items-center justify-between ${
                        userSel !== undefined && isCorrect ? 'bg-green-300 border-green-800 font-black' :
                        isSelected && !isCorrect ? 'bg-red-200 border-red-800' : 'bg-white hover:bg-[#FFFDF5]'
                      }`}
                    >
                      <span>{opt}</span>
                      {userSel !== undefined && isCorrect && <Check className="w-4 h-4 text-green-800 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {fb && (
                <div className={`p-3 comic-border-sm font-black text-xs text-center ${userSel === q.correctIndex ? 'bg-[#FFD83D]' : 'bg-gray-100'}`}>
                  {fb}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
