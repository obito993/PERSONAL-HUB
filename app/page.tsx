'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wrench, 
  GraduationCap, 
  Briefcase, 
  Plus, 
  Check, 
  ArrowRight, 
  Zap, 
  Clock, 
  Calendar,
  Code,
  Search,
  BookOpen,
  Trophy,
  Flame,
  Award,
  Layers,
  Star
} from 'lucide-react';
import { storage, UserState, TaskItem } from '@/lib/storage';
import { sound } from '@/lib/sound';
import { EXACT_18_TOOLS } from '@/app/tools/page';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('GOOD DAY');
  const [userName, setUserName] = useState<string>('HERO');

  // Stats from backend/db
  const [stats, setStats] = useState({
    notesCount: 0,
    applicationsCount: 0,
    flashcardsCount: 0,
    quizzesCount: 0,
    codingSolved: 0,
  });

  const [questAnswer, setQuestAnswer] = useState('');
  const [questSolved, setQuestSolved] = useState(false);

  useEffect(() => {
    // Check intro session state
    const hasSeenIntro = sessionStorage.getItem('dh_intro_seen');
    if (hasSeenIntro) setShowIntro(false);

    setUserState(storage.getUserState());
    setTasks(storage.getTasks());

    // Fetch user profile & stats from server
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserName(data.user.name);
          if (typeof window !== 'undefined') {
            localStorage.setItem('dh_user_name', data.user.name);
          }
        }
      })
      .catch(() => {});

    // Check localStorage fallback for name
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('dh_user_name');
      if (savedName) setUserName(savedName);
    }

    // Fetch real user data stats
    Promise.all([
      fetch('/api/notes').then(r => r.json()).catch(() => ({ notes: [] })),
      fetch('/api/career/applications').then(r => r.json()).catch(() => ({ applications: [] })),
      fetch('/api/study/flashcards').then(r => r.json()).catch(() => ({ flashcards: [] })),
    ]).then(([notesRes, appsRes, cardsRes]) => {
      setStats({
        notesCount: notesRes.notes?.length || 0,
        applicationsCount: appsRes.applications?.length || 0,
        flashcardsCount: cardsRes.flashcards?.length || 0,
        quizzesCount: 0,
        codingSolved: 0,
      });
    });

    // Clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const hr = now.getHours();
      if (hr < 12) setGreeting('GOOD MORNING');
      else if (hr < 18) setGreeting('GOOD AFTERNOON');
      else setGreeting('GOOD EVENING');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const skipIntro = () => {
    setShowIntro(false);
    sessionStorage.getItem('dh_intro_seen');
    sessionStorage.setItem('dh_intro_seen', 'true');
    sound.playPop();
  };

  const scrollToHubContent = () => {
    sound.playPop();
    const element = document.getElementById('dashboard-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const userFirstName = userName && userName !== 'HERO' ? userName.trim().split(' ')[0] : '';
  const userHubTitle = userFirstName 
    ? (userFirstName.toUpperCase().endsWith('S') ? `${userFirstName.toUpperCase()}' HUB` : `${userFirstName.toUpperCase()}'S HUB`)
    : 'PERSONAL HUB';

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const updated = storage.addTask(newTaskTitle, 'TODAY');
    setTasks(updated);
    setUserState(storage.getUserState());
    setNewTaskTitle('');
    sound.playPop();
  };

  const handleToggleTask = (id: string) => {
    const updated = storage.toggleTask(id);
    setTasks(updated);
    sound.playPop();
  };

  const handleQuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questAnswer.trim() === '1316') {
      const { state } = storage.addXP(50);
      setUserState(state);
      setQuestSolved(true);
      sound.playLevelUp();
    } else {
      sound.playPop();
      alert('Almost! 47 × 28 = 1316. Give it another try!');
    }
  };

  const triggerGlobalSearch = () => {
    sound.playPop();
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
    window.dispatchEvent(event);
  };

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  // Find user recent tools objects
  const recentToolIds = userState?.recentTools || ['percentage', 'gst', 'json-formatter'];
  const recentTools = EXACT_18_TOOLS.filter(t => recentToolIds.includes(t.id));

  return (
    <div className="space-y-8 py-4 min-h-screen relative">

      {/* 1. Opening Animation Modal */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#F7F4EA] flex flex-col items-center justify-center p-6 text-center halftone-box"
          >
            <motion.div
              initial={{ scale: 0.85, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white comic-border-lg shadow-comic-lg p-8 max-w-xl w-full relative space-y-4"
            >
              <div className="comic-sticker comic-sticker-yellow text-xs font-black inline-block">
                ★ ISSUE #001 ★ INITIALIZING {userHubTitle}
              </div>

              <h1 className="font-black text-4xl sm:text-6xl tracking-tight uppercase leading-none">
                {userHubTitle}
              </h1>

              <p className="font-mono text-xs sm:text-sm uppercase tracking-wider text-gray-700 font-black">
                YOUR EVERYDAY INTERNET TOOLBOX
              </p>

              <div className="speech-bubble text-sm font-extrabold bg-[#FFFDF5] text-black">
                &quot;HEY {userFirstName ? userFirstName.toUpperCase() : 'HERO'}! READY TO GET THINGS DONE? Welcome to your digital command center!&quot;
              </div>

              <p className="text-xs font-bold text-gray-600">
                Tools. AI. Study. Code. Career. Everything in one place.
              </p>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={skipIntro}
                  className="btn-comic btn-comic-yellow px-8 py-3 text-sm font-black flex items-center gap-2"
                >
                  <span>ENTER THE HUB</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Hero Section */}
      <section 
        className="comic-border-lg shadow-comic-lg p-6 sm:p-10 relative overflow-hidden rounded-2xl border-4 border-black text-white"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.90) 0%, rgba(0, 0, 0, 0.72) 55%, rgba(0, 0, 0, 0.45) 100%), url('/images/media_1790002331662.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Side: Hero Headline & Speech Bubble */}
          <div className="space-y-4 max-w-2xl text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="comic-sticker comic-sticker-yellow font-black text-xs text-black">
                ★ ISSUE #001 ★
              </span>
              <span className="bg-[#B9A7FF] comic-border-sm text-[10px] font-black text-black px-2 py-0.5">
                DIGITAL OPERATING SYSTEM
              </span>
            </div>

            <h1 className="font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase leading-none text-[#FFD83D] drop-shadow-[5px_5px_0_#000]">
              {userFirstName ? (
                <>WELCOME TO<br />{userFirstName.toUpperCase()}&apos;S HUB</>
              ) : (
                <>WELCOME TO<br />THE HUB</>
              )}
            </h1>

            <p className="font-extrabold text-xl sm:text-2xl text-white tracking-tight drop-shadow-[2px_2px_0_#000]">
              YOUR EVERYDAY INTERNET TOOLBOX
            </p>

            <div className="speech-bubble speech-bubble-bottom text-base sm:text-lg font-extrabold text-[#050505] inline-block max-w-md bg-[#FFFDF5] border-3 border-black p-3.5 shadow-comic-md">
              &quot;HEY {userFirstName ? userFirstName.toUpperCase() : 'HERO'}! READY TO GET THINGS DONE?&quot;
            </div>

            <p className="text-xs sm:text-sm font-bold text-gray-200">
              Tools. AI. Study. Code. Career. Everything in one place.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={scrollToHubContent} 
                className="btn-comic btn-comic-yellow px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-1.5"
              >
                <span>ENTER THE HUB</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link 
                href="/tools" 
                className="btn-comic btn-comic-red px-6 py-3 text-xs sm:text-sm font-black flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4" />
                <span>EXPLORE TOOLS</span>
              </Link>
            </div>
          </div>

          {/* Opposite Side (Right): Fitted New Dynamic Universe Image */}
          <div className="w-full lg:w-[460px] flex justify-center">
            <div className="w-full h-[260px] sm:h-[300px] md:h-[330px] relative comic-border-lg border-4 border-black rounded-2xl overflow-hidden shadow-comic-lg bg-black group">
              <img 
                src="/images/media_1790015577498.jpg" 
                alt="YOUR DYNAMIC UNIVERSE" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-2 left-2 bg-[#FFD83D] comic-border-sm px-2.5 py-0.5 text-[10px] font-black text-black">
                ★ YOUR DYNAMIC UNIVERSE ★
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Daily Greeting & Time Status Bar */}
      <div className="bg-[#FFD83D] comic-border-lg p-4 shadow-comic flex flex-col sm:flex-row items-center justify-between gap-4 font-black rounded-xl border-3 border-black">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-black" />
          <div>
            <div className="text-xl tracking-tight uppercase text-black">
              {greeting}, {userName.toUpperCase()}!
            </div>
            <div className="text-xs font-mono font-bold text-black/80">
              {dateString}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userState && (
            <div className="bg-white comic-border px-3 py-1 text-xs font-mono font-black flex items-center gap-2 text-black">
              <Trophy className="w-4 h-4 text-[#FF5A5F]" />
              <span>LEVEL {userState.level} ({userState.xp} XP)</span>
            </div>
          )}
          <div className="bg-white comic-border px-3 py-1 text-xs font-mono font-black flex items-center gap-1.5 text-black">
            <Calendar className="w-3.5 h-3.5 text-[#FF5A5F]" />
            <span>{currentTime || '12:00 PM'}</span>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Panel */}
      <div className="space-y-3">
        <h2 className="font-black text-xl uppercase tracking-tight flex items-center gap-2 text-white drop-shadow-[2px_2px_0_#000]">
          <Zap className="w-5 h-5 text-[#FFD83D]" />
          <span>QUICK ACTIONS</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link href="/tools" onClick={() => sound.playPop()} className="btn-comic bg-[#FFD83D] text-black text-xs p-3 font-black flex flex-col items-center text-center gap-1">
            <Wrench className="w-5 h-5" />
            <span>OPEN TOOLBOX</span>
          </Link>
          <Link href="/study" onClick={() => sound.playPop()} className="btn-comic bg-[#B9A7FF] text-black text-xs p-3 font-black flex flex-col items-center text-center gap-1">
            <GraduationCap className="w-5 h-5" />
            <span>START STUDY</span>
          </Link>
          <Link href="/coding" onClick={() => sound.playPop()} className="btn-comic bg-[#5DADE2] text-black text-xs p-3 font-black flex flex-col items-center text-center gap-1">
            <Code className="w-5 h-5" />
            <span>OPEN CODE ARENA</span>
          </Link>
          <Link href="/career" onClick={() => sound.playPop()} className="btn-comic bg-[#FF5A5F] text-white text-xs p-3 font-black flex flex-col items-center text-center gap-1">
            <Briefcase className="w-5 h-5" />
            <span>VIEW CAREER</span>
          </Link>
          <Link href="/ai" onClick={() => sound.playPop()} className="btn-comic bg-[#A855F7] text-white text-xs p-3 font-black flex flex-col items-center text-center gap-1">
            <Sparkles className="w-5 h-5" />
            <span>ASK AI</span>
          </Link>
          <button onClick={triggerGlobalSearch} className="btn-comic bg-[#FF9F43] text-black text-xs p-3 font-black flex flex-col items-center text-center gap-1">
            <Search className="w-5 h-5" />
            <span>FIND SOMETHING</span>
          </button>
        </div>
      </div>

      {/* 5. Main Dashboard Grid */}
      <div id="dashboard-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">

        {/* Column 1: Daily Missions & Tasks */}
        <div className="space-y-6">
          <div className="comic-card p-5 space-y-4 bg-white/95">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h2 className="font-black text-lg flex items-center gap-2">
                <Check className="w-5 h-5 text-[#FF5A5F]" />
                <span>TODAY&apos;S MISSION TASKS</span>
              </h2>
              <span className="bg-[#B9A7FF] comic-border-sm text-[10px] font-mono font-black px-1.5 py-0.5">
                {tasks.filter(t => t.completed).length}/{tasks.length}
              </span>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new mission task..."
                className="comic-input text-xs flex-1"
              />
              <button type="submit" className="btn-comic btn-comic-yellow p-2">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-gray-500 font-mono">
                  No active tasks today. Add your first mission above!
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-2.5 comic-border-sm cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                      task.completed ? 'bg-gray-100 line-through text-gray-500' : 'bg-white hover:bg-[#FFFDF5]'
                    }`}
                  >
                    <span>{task.title}</span>
                    <div className={`w-4 h-4 comic-border-sm flex items-center justify-center ${task.completed ? 'bg-[#FF5A5F] text-white' : 'bg-white'}`}>
                      {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User Progress Stats */}
          <div className="comic-card-cream p-5 space-y-3 bg-[#FFFDF5]/95">
            <h3 className="font-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
              <Layers className="w-5 h-5 text-[#5DADE2]" />
              <span>YOUR WORKSPACE METRICS</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
              <div className="bg-white p-3 border-2 border-black rounded-xl">
                <div className="text-gray-600 font-sans text-[10px]">CAREER APPS</div>
                <div className="text-xl font-black text-black">{stats.applicationsCount} Tracked</div>
              </div>
              <div className="bg-white p-3 border-2 border-black rounded-xl">
                <div className="text-gray-600 font-sans text-[10px]">FLASHCARDS</div>
                <div className="text-xl font-black text-black">{stats.flashcardsCount} Cards</div>
              </div>
              <div className="bg-white p-3 border-2 border-black rounded-xl">
                <div className="text-gray-600 font-sans text-[10px]">SAVED NOTES</div>
                <div className="text-xl font-black text-black">{stats.notesCount} Notes</div>
              </div>
              <div className="bg-white p-3 border-2 border-black rounded-xl">
                <div className="text-gray-600 font-sans text-[10px]">DAILY XP</div>
                <div className="text-xl font-black text-black">{userState?.xp || 0} XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Daily Quest & Code Arena */}
        <div className="space-y-6">
          <div className="comic-card-yellow p-5 space-y-4 bg-[#FFD83D]/95">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h2 className="font-black text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FF5A5F]" />
                <span>DAILY QUEST</span>
              </h2>
              <span className="bg-[#FF5A5F] text-white comic-border-sm text-[10px] font-mono font-black px-1.5 py-0.5">
                +50 XP
              </span>
            </div>

            <div className="text-xs font-bold text-gray-800">
              Solve today&apos;s mental crunch quest to earn XP:
            </div>

            <div className="text-sm font-extrabold bg-white comic-border p-3">
              ⚡ 47 × 28 = ?
            </div>

            {questSolved ? (
              <div className="bg-white comic-border p-3 text-center font-black text-xs text-green-700">
                🎉 QUEST COMPLETED! +50 XP AWARDED!
              </div>
            ) : (
              <form onSubmit={handleQuestSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={questAnswer}
                  onChange={(e) => setQuestAnswer(e.target.value)}
                  placeholder="Enter answer..."
                  className="comic-input text-xs flex-1 font-mono"
                />
                <button type="submit" className="btn-comic btn-comic-red px-4 text-xs font-black">
                  SUBMIT
                </button>
              </form>
            )}
          </div>

          {/* Recently Used Tools */}
          <div className="comic-card p-5 space-y-3 bg-white/95">
            <h3 className="font-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
              <Wrench className="w-5 h-5 text-[#FFD83D]" />
              <span>RECENTLY USED TOOLS</span>
            </h3>

            <div className="space-y-2">
              {recentTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={() => sound.playPop()}
                    className="flex items-center justify-between p-2.5 bg-white border-2 border-black rounded-xl hover:bg-[#FFD83D]/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded border border-black" style={{ backgroundColor: tool.hexColor }}>
                        <ToolIcon className="w-4 h-4 text-black stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-black">{tool.name}</div>
                        <div className="text-[10px] font-mono font-bold text-gray-500">{tool.heroIdentity}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Achievements & Deion AI */}
        <div className="space-y-6">
          <div className="comic-card-purple p-5 space-y-4 bg-[#B9A7FF]/95">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h2 className="font-black text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-[#050505]" />
                <span>EARNED ACHIEVEMENTS</span>
              </h2>
              <span className="comic-sticker bg-white text-[10px]">
                BADGES
              </span>
            </div>

            {userState?.badges && userState.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userState.badges.map((badge, idx) => (
                  <span key={idx} className="bg-white comic-border-sm px-2.5 py-1 text-xs font-black flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#FFD83D] fill-[#FFD83D]" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="bg-white comic-border p-4 text-center font-mono font-bold text-xs text-gray-700 space-y-1">
                <Award className="w-8 h-8 mx-auto text-purple-400" />
                <div className="font-black text-black">YOUR FIRST BADGE IS WAITING!</div>
                <div className="text-[10px] text-gray-500">Complete tasks, study sessions, and coding challenges to unlock comic badges.</div>
              </div>
            )}
          </div>

          <div className="comic-card p-5 space-y-4 bg-white/95">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h2 className="font-black text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#A855F7]" />
                <span>DEION MULTI-PROVIDER AI</span>
              </h2>
              <span className="comic-sticker comic-sticker-purple text-[10px]">
                LOCAL FIRST
              </span>
            </div>

            <div className="speech-bubble text-xs font-bold bg-[#FFFDF5] text-black">
              &quot;Ask AI to summarize study PDFs, review code, or generate interview questions!&quot;
            </div>

            <Link href="/ai" onClick={() => sound.playPop()} className="btn-comic bg-[#A855F7] text-[#FFFFFF] w-full py-2.5 text-xs font-black flex items-center justify-center gap-2">
              <span>OPEN INTELLIGENCE AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
