'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Code, 
  Play, 
  Lightbulb, 
  Check, 
  Lock, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Flame, 
  Award, 
  Layers, 
  ArrowLeft,
  ChevronRight,
  Send,
  History,
  CheckCircle2,
  XCircle,
  Brain
} from 'lucide-react';
import { ALL_CODING_CHALLENGES, Challenge } from '@/lib/coding/challenges';
import { executeChallengeCode, ExecutionResult } from '@/lib/coding/runner';
import { storage, UserState } from '@/lib/storage';
import { sound } from '@/lib/sound';

interface SubmissionRecord {
  id: string;
  challengeId: string;
  attemptNumber: number;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  xpEarned: number;
  code: string;
  approach: string;
  timestamp: string;
}

function CodeArenaPageContent() {
  const [selectedLang, setSelectedLang] = useState<'PYTHON' | 'JAVASCRIPT' | 'HTML' | 'CSS'>('PYTHON');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [langExp, setLangExp] = useState<{ [key: string]: number }>({
    PYTHON: 350,
    JAVASCRIPT: 200,
    HTML: 500,
    CSS: 150,
  });

  // Active Challenge State
  const [activeChallenge, setActiveChallenge] = useState<Challenge>(
    ALL_CODING_CHALLENGES.find(c => c.language === 'PYTHON' && c.level === 1) || ALL_CODING_CHALLENGES[0]
  );
  const [userCode, setUserCode] = useState<string>(activeChallenge.starterCode);
  const [userApproach, setUserApproach] = useState<string>('');

  // Hints State
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);

  // Execution & AI State
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [aiCoachMessage, setAiCoachMessage] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);

  const getLangPrefix = (lang: string) => {
    if (lang === 'JAVASCRIPT') return 'js';
    if (lang === 'PYTHON') return 'py';
    if (lang === 'HTML') return 'html';
    if (lang === 'CSS') return 'css';
    return lang.toLowerCase();
  };

  useEffect(() => {
    setUserState(storage.getUserState());
    
    // Load completed challenge IDs from storage
    if (typeof window !== 'undefined') {
      const savedCompleted = localStorage.getItem('dh_completed_challenges');
      if (savedCompleted) {
        setCompletedIds(JSON.parse(savedCompleted));
      } else {
        setCompletedIds(['py_1', 'js_1', 'html_1', 'css_1']);
      }
    }
  }, []);

  const saveCompletedChallenge = (id: string, xp: number, lang: string) => {
    const prefix = getLangPrefix(lang);
    const currentLvl = parseInt(id.split('_')[1] || '1', 10);
    const nextLvlId = `${prefix}_${currentLvl + 1}`;

    const updated = Array.from(new Set([...completedIds, id, nextLvlId]));
    setCompletedIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dh_completed_challenges', JSON.stringify(updated));
    }

    setLangExp(prev => ({
      ...prev,
      [lang]: (prev[lang] || 0) + xp,
    }));
  };

  const handleLanguageChange = (lang: 'PYTHON' | 'JAVASCRIPT' | 'HTML' | 'CSS') => {
    setSelectedLang(lang);
    const firstChallenge = ALL_CODING_CHALLENGES.find(c => c.language === lang && c.level === 1) || ALL_CODING_CHALLENGES[0];
    selectChallenge(firstChallenge);
  };

  const selectChallenge = (ch: Challenge) => {
    const prefix = getLangPrefix(ch.language);
    // Level 1 is always unlocked. Level N requires Level N-1 to be completed or Level N already completed.
    const isUnlocked = ch.level === 1 || completedIds.includes(`${prefix}_${ch.level - 1}`) || completedIds.includes(ch.id);
    if (!isUnlocked) {
      alert(`🔒 Level ${ch.level} is locked! Complete Level ${ch.level - 1} to unlock.`);
      sound.playPop();
      return;
    }

    setActiveChallenge(ch);
    setUserCode(ch.starterCode);
    setUserApproach('');
    setActiveHintLevel(0);
    setExecResult(null);
    setAiCoachMessage(null);
    sound.playPop();
  };

  // Run & Test Execution
  const handleRunCode = () => {
    sound.playPop();
    const result = executeChallengeCode(activeChallenge, userCode);
    setExecResult(result);

    const isFirstTime = !completedIds.includes(activeChallenge.id);
    const hintBonus = activeHintLevel === 0 ? 25 : 0;
    const totalXpAward = result.passed && isFirstTime ? activeChallenge.xpReward + hintBonus : 0;

    // Record submission
    const newRecord: SubmissionRecord = {
      id: 'sub_' + Date.now(),
      challengeId: activeChallenge.id,
      attemptNumber: submissions.filter(s => s.challengeId === activeChallenge.id).length + 1,
      passed: result.passed,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      xpEarned: totalXpAward,
      code: userCode,
      approach: userApproach,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSubmissions(prev => [newRecord, ...prev]);

    if (result.passed) {
      saveCompletedChallenge(activeChallenge.id, isFirstTime ? activeChallenge.xpReward + hintBonus : 0, activeChallenge.language);
      if (isFirstTime) {
        const { state } = storage.addXP(activeChallenge.xpReward + hintBonus);
        setUserState(state);
      }
      sound.playLevelUp();
    } else {
      sound.playPop();
    }
  };

  // DEION AI Code Coach
  const askAiCoach = async (queryType: string) => {
    setLoadingAi(true);
    sound.playPop();

    const promptText = `
Role: Deion Hub AI Code Coach
Language: ${activeChallenge.language}
Level: ${activeChallenge.level} (${activeChallenge.title})
Problem Description: ${activeChallenge.description}
User's Code:
\`\`\`
${userCode}
\`\`\`
User's Problem Approach Explanation: ${userApproach || 'None provided yet.'}
Execution Result Passed: ${execResult?.passed || false}
Failed Test Feedback: ${execResult?.visibleResults.filter(r => !r.passed).map(r => `Input: ${r.input}, Expected: ${r.expected}, Received: ${r.received}`).join('; ') || 'None'}

User Request: "${queryType}"
Give supportive guidance and hints without giving away the full answer immediately unless asked.
    `;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          mode: 'CODING',
          prompt: promptText
        })
      });
      const data = await res.json();
      setAiCoachMessage(data.result);
      sound.playLevelUp();
    } catch {
      setAiCoachMessage("⚡ [AI CODE COACH]: Great effort! Double-check your syntax and return values.");
    } finally {
      setLoadingAi(false);
    }
  };

  const currentLangChallenges = ALL_CODING_CHALLENGES.filter(c => c.language === selectedLang);

  // Calculate language stats
  const completedInLang = currentLangChallenges.filter(c => completedIds.includes(c.id)).length;
  const currentLangLevel = Math.max(1, Math.min(52, completedInLang + 1));
  const currentLangXp = langExp[selectedLang] || (completedInLang * 80);

  return (
    <div className="space-y-8 py-6">

      {/* 1. Header Identity */}
      <div className="bg-[#18181B] text-white comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD83D] text-black comic-border-sm px-3 py-1 font-mono font-black text-xs">
              ★ 200+ LEVELS ACTIVE ★
            </span>
            <span className="comic-sticker comic-sticker-purple text-xs font-black">
              PYTHON • JAVASCRIPT • HTML • CSS
            </span>
          </div>

          <Link href="/study" className="text-xs font-mono font-bold text-gray-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO STUDY LAB</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight text-[#FFD83D] flex items-center gap-3">
            <Code className="w-10 h-10 stroke-[2.8]" />
            <span>CODE ARENA</span>
          </h1>
          <p className="font-bold text-xs sm:text-sm text-gray-300 italic">
            &quot;LEARN → TYPE SOLUTION → RUN → TEST → LEVEL UP.&quot;
          </p>
        </div>
      </div>

      {/* 2. Language Progress Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { lang: 'PYTHON', icon: '🐍', color: 'bg-[#FFD83D] text-black', maxLvl: 52 },
          { lang: 'JAVASCRIPT', icon: '⚡', color: 'bg-[#5DADE2] text-black', maxLvl: 52 },
          { lang: 'HTML', icon: '🌐', color: 'bg-[#FF5A5F] text-white', maxLvl: 52 },
          { lang: 'CSS', icon: '🎨', color: 'bg-[#B9A7FF] text-black', maxLvl: 52 },
        ].map((item) => {
          const isSelected = selectedLang === item.lang;
          const lChallenges = ALL_CODING_CHALLENGES.filter(c => c.language === item.lang);
          const done = lChallenges.filter(c => completedIds.includes(c.id)).length;
          const lvl = Math.max(1, Math.min(52, done + 1));
          const xp = langExp[item.lang] || (done * 80);

          return (
            <button
              key={item.lang}
              onClick={() => handleLanguageChange(item.lang as any)}
              className={`p-4 comic-border-md rounded-2xl text-left transition-all ${
                isSelected ? 'scale-105 shadow-comic-md border-4 border-black ' + item.color : 'bg-white hover:bg-[#FFFDF5] text-black'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xl">{item.icon}</span>
                <span className="font-mono text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5 rounded">
                  LVL {lvl}
                </span>
              </div>
              <div className="font-black text-sm uppercase">{item.lang}</div>
              <div className="font-mono text-[10px] font-bold opacity-80 mt-1">
                {done} / {item.maxLvl} Levels • {xp} XP
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full mt-2 overflow-hidden border border-black/40">
                <div 
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (done / item.maxLvl) * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Level Progression Selector Grid (52 Levels) */}
      <div className="bg-white comic-border-lg p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-3 gap-2">
          <div>
            <h3 className="font-black text-xl uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#5DADE2]" />
              <span>{selectedLang} PROGRESSION (52 LEVELS)</span>
            </h3>
            <p className="text-xs font-bold text-gray-600">Select an unlocked level to solve. Complete previous level to unlock next!</p>
          </div>

          <div className="font-mono text-xs font-black bg-[#FFD83D] px-3 py-1 comic-border-sm">
            ACTIVE LEVEL {activeChallenge.level}: {activeChallenge.title}
          </div>
        </div>

        {/* Level Buttons Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-13 gap-2">
          {currentLangChallenges.map((ch) => {
            const isCompleted = completedIds.includes(ch.id);
            const prefix = getLangPrefix(ch.language);
            const isUnlocked = ch.level === 1 || completedIds.includes(`${prefix}_${ch.level - 1}`) || isCompleted;
            const isActive = activeChallenge.id === ch.id;

            return (
              <button
                key={ch.id}
                onClick={() => selectChallenge(ch)}
                disabled={!isUnlocked}
                title={`Level ${ch.level}: ${ch.title} (${ch.category})`}
                className={`p-2 comic-border-sm rounded-xl font-mono text-xs font-black flex flex-col items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-[#5DADE2] text-black ring-4 ring-black scale-110 shadow-comic-sm'
                    : isCompleted
                    ? 'bg-[#2ECC71] text-black'
                    : isUnlocked
                    ? 'bg-white hover:bg-[#FFD83D] text-black'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {!isUnlocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span>L{ch.level}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Code Arena Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Problem Description & Explanation */}
        <div className="lg:col-span-4 bg-white comic-border-lg p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="comic-sticker bg-[#5DADE2] text-black text-[10px] font-black border border-black">
              STAGE: {activeChallenge.category}
            </span>
            <span className="bg-[#FF5A5F] text-white px-2 py-0.5 text-[10px] font-mono font-black border border-black">
              +{activeChallenge.xpReward} XP
            </span>
          </div>

          <div>
            <div className="font-mono text-xs font-black text-gray-500 uppercase">LEVEL {activeChallenge.level}</div>
            <h2 className="font-black text-2xl uppercase tracking-tight text-black">{activeChallenge.title}</h2>
          </div>

          <div className="text-xs font-bold text-gray-800 leading-relaxed bg-[#FFFDF5] comic-border-sm p-4 whitespace-pre-wrap">
            {activeChallenge.description}
          </div>

          {/* MY APPROACH Explanation Textarea */}
          <div className="space-y-2 pt-2 border-t-2 border-black">
            <label className="block text-xs font-black uppercase flex items-center gap-1.5 text-purple-800">
              <Brain className="w-4 h-4" />
              <span>MY APPROACH (PROBLEM-SOLVING EXPLANATION)</span>
            </label>
            <textarea
              value={userApproach}
              onChange={(e) => setUserApproach(e.target.value)}
              placeholder="Type your reasoning, logic steps, or algorithm explanation here..."
              rows={4}
              className="comic-input w-full text-xs font-mono"
            />
          </div>

          {/* AI Code Coach Button */}
          <div className="pt-2">
            <button
              onClick={() => askAiCoach("Explain how to approach this problem step-by-step.")}
              disabled={loadingAi}
              className="btn-comic bg-[#A855F7] text-white w-full py-2.5 text-xs font-black flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ASK AI CODE COACH</span>
            </button>
          </div>

          {aiCoachMessage && (
            <div className="bg-purple-950 text-purple-100 p-4 comic-border-sm rounded-xl text-xs font-mono space-y-2">
              <div className="font-black text-[#B9A7FF] flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>AI COACH GUIDANCE:</span>
              </div>
              <p className="whitespace-pre-wrap">{aiCoachMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Test Runner */}
        <div className="lg:col-span-8 space-y-4">

          {/* Editor Header & Hints Toolbar */}
          <div className="bg-[#18181B] text-white comic-border-lg p-6 shadow-comic-lg rounded-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5A5F]" />
                <span className="w-3 h-3 rounded-full bg-[#FFD83D]" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-gray-300 font-bold ml-2">solution.{activeChallenge.language.toLowerCase()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveHintLevel(prev => Math.min(3, prev + 1))}
                  className="btn-comic bg-purple-600 text-white text-xs px-3 py-1 font-black flex items-center gap-1"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>HINT ({activeHintLevel}/3)</span>
                </button>
                <button
                  onClick={() => { setUserCode(activeChallenge.starterCode); setExecResult(null); sound.playPop(); }}
                  className="btn-comic bg-gray-700 text-white text-xs px-3 py-1 font-black flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>
              </div>
            </div>

            {/* Progressive Hint Callout */}
            {activeHintLevel > 0 && (
              <div className="bg-[#FFD83D] text-black comic-border-sm p-3 text-xs font-bold font-sans space-y-1">
                <div className="font-black">💡 HINT LEVEL {activeHintLevel}:</div>
                <div>{activeChallenge.hints[activeHintLevel - 1]}</div>
                {activeHintLevel === 0 && <div className="text-[10px] font-mono text-gray-700">+25 XP No-Hint Bonus Available!</div>}
              </div>
            )}

            {/* Visual Fill-in-the-Blank Code Input Box Container */}
            <div className="relative border-2 border-dashed border-[#5DADE2] p-3.5 rounded-xl bg-[#09090B]/90 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#FFD83D] border-b border-gray-700 pb-2">
                <span>✏️ TYPE YOUR CODE ANSWER IN THE BOX BELOW:</span>
                <span className="text-gray-400">INPUT AREA ____</span>
              </div>

              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={11}
                placeholder="Type your answer here..."
                className="w-full bg-[#09090B] border-2 border-gray-700 p-4 text-xs text-green-400 focus:outline-none focus:border-[#5DADE2] font-mono leading-relaxed rounded-lg underline-offset-4 tracking-wide"
              />

              <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 pt-1">
                <span>Ensure tags, return statements, or CSS rules match the problem requirement.</span>
                <span className="text-emerald-400 font-bold">DEION HUB ARENA EVALUATOR ACTIVE</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-3">
              <button
                onClick={handleRunCode}
                className="btn-comic bg-[#2ECC71] text-black flex-1 py-3 text-sm font-black flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>RUN CODE & SUBMIT</span>
              </button>
            </div>

            {/* Execution Test Results Display */}
            {execResult && (
              <div className="space-y-3 pt-2">
                {execResult.passed ? (
                  <div className="bg-green-950 border-2 border-green-500 p-4 rounded-xl text-green-200 font-sans space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-black text-xl text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" />
                        <span>POW! SOLUTION ACCEPTED!</span>
                      </div>

                      {activeChallenge.level < 52 && (
                        <button
                          onClick={() => {
                            const nextCh = ALL_CODING_CHALLENGES.find(c => c.language === activeChallenge.language && c.level === activeChallenge.level + 1);
                            if (nextCh) selectChallenge(nextCh);
                          }}
                          className="btn-comic bg-[#FFD83D] text-black px-4 py-2 font-black text-xs flex items-center gap-1.5"
                        >
                          <span>NEXT LEVEL {activeChallenge.level + 1}</span>
                          <ChevronRight className="w-4 h-4 stroke-[3]" />
                        </button>
                      )}
                    </div>

                    <div className="text-xs font-mono font-bold space-y-1">
                      <div>✓ ALL TESTS PASSED ({execResult.passedTests}/{execResult.totalTests})</div>
                      <div>✓ LEVEL {activeChallenge.level} COMPLETE! LEVEL {activeChallenge.level + 1} UNLOCKED!</div>
                      <div>✓ +{activeChallenge.xpReward} EXP EARNED!</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950 border-2 border-red-500 p-4 rounded-xl text-red-200 font-sans space-y-3">
                    <div className="font-black text-xl text-red-400 flex items-center gap-2">
                      <XCircle className="w-6 h-6" />
                      <span>TRY AGAIN! TEST FAILED</span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      {execResult.visibleResults.map((r, idx) => (
                        <div key={idx} className={`p-2 border rounded ${r.passed ? 'bg-green-900/40 border-green-700 text-green-300' : 'bg-red-900/40 border-red-700 text-red-300'}`}>
                          <div>Test #{idx + 1}: {r.passed ? '✓ PASSED' : '✗ FAILED'}</div>
                          <div>Input: <code className="bg-black px-1">{r.input}</code></div>
                          <div>Expected: <code className="bg-black px-1">{r.expected}</code></div>
                          <div>Received: <code className="bg-black px-1">{r.received}</code></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Submission History Log */}
            {submissions.filter(s => s.challengeId === activeChallenge.id).length > 0 && (
              <div className="pt-4 border-t border-gray-800 space-y-2">
                <div className="text-xs font-black uppercase text-gray-400 flex items-center gap-1.5">
                  <History className="w-4 h-4" />
                  <span>SUBMISSION HISTORY</span>
                </div>
                <div className="space-y-1 text-xs">
                  {submissions.filter(s => s.challengeId === activeChallenge.id).map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center bg-gray-900 p-2 border border-gray-800 rounded">
                      <span className="font-mono">Attempt #{sub.attemptNumber}</span>
                      <span className={sub.passed ? 'text-green-400 font-black' : 'text-red-400 font-black'}>
                        {sub.passed ? `✓ ACCEPTED (${sub.passedTests}/${sub.totalTests} tests) +${sub.xpEarned} EXP` : `✗ FAILED (${sub.passedTests}/${sub.totalTests} tests)`}
                      </span>
                      <span className="text-[10px] text-gray-500">{sub.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING CODE ARENA...</div>}>
      <CodeArenaPageContent />
    </Suspense>
  );
}
