'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  Wrench, 
  Calculator, 
  FileText, 
  Timer, 
  ArrowRight, 
  X,
  Zap,
  QrCode,
  Code,
  GraduationCap,
  Briefcase,
  Clock,
  Star,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Loader2,
  Bot,
  Settings,
  Trash2
} from 'lucide-react';
import { EXACT_18_TOOLS } from '@/app/tools/page';
import { storage, NoteItem, ApplicationItem, HabitItem, TaskItem } from '@/lib/storage';
import { sound } from '@/lib/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CommandSearchResult {
  id: string;
  title: string;
  desc: string;
  href: string;
  category: 'TOOLS' | 'STUDY' | 'CODE ARENA' | 'CAREER' | 'AI' | 'NOTES' | 'RECENT' | 'SETTINGS' | 'APPLICATIONS' | 'HABITS';
  icon: React.ElementType;
  badge: string;
  keywords?: string[];
  colorBg?: string;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K');

  // AI Fallback state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Intent parsing result state
  const [intentResult, setIntentResult] = useState<{
    label: string;
    value: string;
    actionText: string;
    actionHref: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Local storage real user items
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.includes('Mac');
      setShortcutLabel(isMac ? '⌘K' : 'Ctrl K');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      sound.playPop();

      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dh_recent_searches');
        if (saved) {
          try {
            setRecentSearches(JSON.parse(saved));
          } catch {
            setRecentSearches([]);
          }
        }
        setFavorites(storage.getUserState().favorites || []);
        setNotes(storage.getNotes() || []);
        setApplications(storage.getApplications() || []);
        setHabits(storage.getHabits() || []);
        setTasks(storage.getTasks() || []);
      }
    } else {
      setQuery('');
      setAiResult(null);
      setIntentResult(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter(s => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dh_recent_searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    sound.playPop();
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dh_recent_searches');
    }
  };

  // Compile database of real workspace items
  const compileSearchDatabase = useCallback((): CommandSearchResult[] => {
    const db: CommandSearchResult[] = [];

    // 1. 18 Superhero Tools
    EXACT_18_TOOLS.forEach(tool => {
      db.push({
        id: `tool_${tool.id}`,
        title: tool.name,
        desc: `${tool.heroIdentity} — ${tool.description}`,
        href: tool.href,
        category: 'TOOLS',
        icon: tool.icon,
        badge: tool.issueNo,
        keywords: [tool.heroIdentity.toLowerCase(), tool.category.toLowerCase()]
      });
    });

    // 2. AI Assistant & Utilities
    db.push(
      {
        id: 'ai_lab',
        title: 'Deion Multi-Provider AI Laboratory',
        desc: 'Local-first comic AI assistant powered by Ollama, Gemini, and Groq',
        href: '/ai',
        category: 'AI',
        icon: Sparkles,
        badge: 'LOCAL AI',
        keywords: ['chat', 'bot', 'ollama', 'gemini', 'groq', 'ai', 'ask', 'assistant']
      },
      {
        id: 'ai_flashcard',
        title: 'AI Flashcards Engine',
        desc: 'Generate interactive flip decks from any study topic',
        href: '/study',
        category: 'AI',
        icon: GraduationCap,
        badge: 'STUDY AI',
        keywords: ['flashcards', 'cards', 'study', 'quiz']
      }
    );

    // 3. Study Lab & Real Notes
    db.push({
      id: 'study_theory',
      title: 'Theory Lab (Study Hub)',
      desc: 'Upload PDFs, notes & images to generate AI explanations & flashcards',
      href: '/study',
      category: 'STUDY',
      icon: GraduationCap,
      badge: 'THEORY LAB',
      keywords: ['theory', 'pdf', 'notes', 'study', 'learn']
    });

    notes.forEach(note => {
      db.push({
        id: `note_${note.id}`,
        title: `Note: ${note.title}`,
        desc: `[${note.subject}] ${note.content.slice(0, 70)}...`,
        href: '/study',
        category: 'NOTES',
        icon: FileText,
        badge: note.subject,
        keywords: [note.title.toLowerCase(), note.subject.toLowerCase(), note.content.toLowerCase()]
      });
    });

    // 4. Code Arena & Challenges
    db.push(
      {
        id: 'code_arena_main',
        title: 'Code Arena (Main Hub)',
        desc: '208 Interactive coding challenges across Python, JS, HTML & CSS',
        href: '/coding',
        category: 'CODE ARENA',
        icon: Code,
        badge: '208 LEVELS',
        keywords: ['code', 'python', 'javascript', 'html', 'css', 'programming']
      },
      {
        id: 'code_python',
        title: 'Python Code Arena (52 Levels)',
        desc: 'Master Python syntax, arrays, loops, functions & logic',
        href: '/coding?lang=python',
        category: 'CODE ARENA',
        icon: Code,
        badge: 'PYTHON',
        keywords: ['python', 'py', 'coding']
      },
      {
        id: 'code_js',
        title: 'JavaScript Code Arena (52 Levels)',
        desc: 'Master ES6+, DOM methods, closures & algorithms',
        href: '/coding?lang=javascript',
        category: 'CODE ARENA',
        icon: Code,
        badge: 'JAVASCRIPT',
        keywords: ['javascript', 'js', 'web']
      }
    );

    // 5. Career & Real Applications
    db.push(
      {
        id: 'career_kanban',
        title: 'Career Mission Board',
        desc: 'Manage job applications across 6 Kanban status stages & timeline',
        href: '/career',
        category: 'CAREER',
        icon: Briefcase,
        badge: 'MISSION CONTROL',
        keywords: ['career', 'jobs', 'kanban', 'applications', 'wishlist', 'applied', 'interview']
      },
      {
        id: 'career_resume',
        title: 'Resume ATS Matcher',
        desc: 'Analyze job description against resume using OpenAI ATS scoring',
        href: '/career/resume',
        category: 'CAREER',
        icon: Sparkles,
        badge: 'ATS SCORE',
        keywords: ['resume', 'ats', 'match', 'career ai']
      }
    );

    applications.forEach(app => {
      db.push({
        id: `app_${app.id}`,
        title: `${app.role} at ${app.company}`,
        desc: `Status: [${app.status}] • ${app.location || 'Remote'}`,
        href: '/career',
        category: 'APPLICATIONS',
        icon: Briefcase,
        badge: app.status,
        keywords: [app.role.toLowerCase(), app.company.toLowerCase(), app.status.toLowerCase()]
      });
    });

    // 6. Habits & Tasks
    habits.forEach(h => {
      db.push({
        id: `habit_${h.id}`,
        title: `Habit: ${h.title}`,
        desc: `Streak: 🔥 ${h.streak} Days (Best: ${h.bestStreak})`,
        href: '/',
        category: 'HABITS',
        icon: CheckCircle,
        badge: `STREAK ${h.streak}`,
        keywords: [h.title.toLowerCase(), 'habit', 'streak']
      });
    });

    // 7. Settings
    db.push(
      {
        id: 'set_sound',
        title: 'Audio Sound Effects Toggle',
        desc: 'Toggle comic pop sound effects and ambient audio feedback',
        href: '/',
        category: 'SETTINGS',
        icon: Settings,
        badge: 'AUDIO',
        keywords: ['sound', 'audio', 'mute']
      },
      {
        id: 'set_clear',
        title: 'Clear Local Storage Data',
        desc: 'Reset all stored tasks, habits, applications, and settings',
        href: '/',
        category: 'SETTINGS',
        icon: Trash2,
        badge: 'DATA',
        keywords: ['clear', 'reset', 'data', 'delete']
      }
    );

    return db;
  }, [notes, applications, habits]);

  // Natural Language Intent Router
  useEffect(() => {
    if (!query.trim()) {
      setIntentResult(null);
      return;
    }

    const q = query.trim().toLowerCase();

    // Intent 1: Percentage
    const pctMatch = q.match(/(\d+(?:\.\d+)?)%\s*of\s*(\d+(?:\.\d+)?)/) || q.match(/calculate\s*(\d+(?:\.\d+)?)%\s*of\s*(\d+(?:\.\d+)?)/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const base = parseFloat(pctMatch[2]);
      const res = (pct / 100) * base;
      setIntentResult({
        label: `Lightning Percentage Calculator`,
        value: `⚡ ${pct}% of ${base} = ${res.toLocaleString()}`,
        actionText: 'Open Percentage Calculator',
        actionHref: '/tools/calculators?tool=percentage'
      });
      return;
    }

    // Intent 2: GST
    const gstMatch = q.match(/(\d+)%\s*gst\s*on\s*(\d+)/) || q.match(/gst\s*for\s*(\d+)/) || q.match(/gst\s*(\d+)/);
    if (gstMatch) {
      const rate = gstMatch[2] ? parseFloat(gstMatch[1]) : 18;
      const base = parseFloat(gstMatch[2] || gstMatch[1]);
      const gstAmt = (base * rate) / 100;
      const total = base + gstAmt;
      setIntentResult({
        label: `Tax Hero GST Computation`,
        value: `⚡ GST (${rate}%): ₹${gstAmt.toLocaleString()} | Total: ₹${total.toLocaleString()}`,
        actionText: 'Open GST Calculator',
        actionHref: '/tools/calculators?tool=gst'
      });
      return;
    }

    // Intent 3: QR Code
    if (q.includes('qr') || q.includes('make qr') || q.includes('generate qr')) {
      const textMatch = q.replace(/make a qr for this website|make a qr|make qr|generate qr|qr code for|qr/g, '').trim();
      setIntentResult({
        label: `The Signal Hero Quick QR Generator`,
        value: `⚡ Generate comic QR code for "${textMatch || 'current website'}"`,
        actionText: 'Generate QR Code Now',
        actionHref: `/tools/qr?text=${encodeURIComponent(textMatch || 'https://deionshub.app')}`
      });
      return;
    }

    // Intent 4: Coding Challenge Request
    if (q.includes('python challenge') || q.includes('js challenge') || q.includes('start python level') || q.includes('coding level')) {
      let lang = 'python';
      if (q.includes('js') || q.includes('javascript')) lang = 'javascript';
      const levelMatch = q.match(/level\s*(\d+)/);
      const lvl = levelMatch ? levelMatch[1] : '1';

      setIntentResult({
        label: `Code Arena Challenge Portal`,
        value: `⚡ Jump straight to ${lang.toUpperCase()} Arena Level ${lvl}`,
        actionText: `Launch ${lang.toUpperCase()} Level ${lvl}`,
        actionHref: `/coding?lang=${lang}`
      });
      return;
    }

    setIntentResult(null);
  }, [query]);

  // Filter items
  const allItems = compileSearchDatabase();
  const filteredItems = allItems.filter(item => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q) ||
      (item.keywords?.some(k => k.includes(q)) ?? false)
    );
  });

  // Group filtered items by category
  const groupedResults = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandSearchResult[]>);

  // Flattened array for keyboard navigation
  const flatFilteredItems = Object.values(groupedResults).flat();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      sound.playPop();
      setSelectedIndex(prev => (prev < flatFilteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      sound.playPop();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatFilteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (intentResult) {
        sound.playPop();
        addRecentSearch(query);
        router.push(intentResult.actionHref);
        onClose();
        return;
      }
      if (flatFilteredItems.length > 0 && flatFilteredItems[selectedIndex]) {
        sound.playPop();
        addRecentSearch(query);
        router.push(flatFilteredItems[selectedIndex].href);
        onClose();
      } else if (query.trim()) {
        triggerAiFallback();
      }
    }
  };

  const triggerAiFallback = async () => {
    if (!query.trim() || aiLoading) return;
    setAiLoading(true);
    sound.playPop();
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `User searched DEIONS HUB for: "${query}". Provide a direct 2-sentence comic-styled guide explaining how DEIONS HUB tools or standard web utilities fulfill this request.`,
          mode: 'GENERAL'
        })
      });
      const data = await res.json();
      if (data.result) {
        setAiResult(data.result);
      } else {
        setAiResult("HMM! I couldn't reach the AI satellite, but try searching for Percentage, GST, PDF, QR, or Code Arena!");
      }
    } catch {
      setAiResult("AI Connection fallback: Try searching for 'percentage', 'python', 'pdf', or 'career'.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  let globalIndexCounter = 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 md:pt-20 px-3 sm:px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-[#FFFDF5] comic-border-lg shadow-comic-lg p-4 sm:p-6 relative max-h-[85vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-150 border-4 border-black rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-3 border-black">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFD83D] comic-border-sm px-3 py-1 text-xs font-black text-black">
              ⚡ DEIONS HUB GLOBAL FIND
            </span>
            <span className="text-xs font-mono font-bold text-gray-600 hidden sm:inline">
              GLOBAL COMMAND CENTER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-[10px] font-mono px-2 py-0.5 font-bold rounded">
              {shortcutLabel}
            </span>
            <button 
              onClick={onClose} 
              className="btn-comic btn-comic-red p-1 text-xs"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAiResult(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="WHAT ARE YOU LOOKING FOR? (Search tools, study, code, career, AI...)"
            className="w-full comic-input text-base sm:text-lg pl-11 pr-20 font-bold uppercase tracking-tight py-3"
            autoFocus
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIntentResult(null);
                sound.playPop();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-comic btn-comic-red text-[11px] px-2 py-0.5 font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Natural Language Intent Result Card */}
        {intentResult && (
          <div className="mb-4 bg-[#FFD83D] comic-border-md p-3.5 rounded-xl shadow-comic-sm space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-black stroke-[3]" />
              <span className="font-mono text-xs font-black uppercase text-black">
                {intentResult.label}
              </span>
            </div>

            <div className="text-base sm:text-lg font-black text-black font-mono bg-white p-2.5 border-2 border-black rounded-lg">
              {intentResult.value}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  sound.playPop();
                  addRecentSearch(query);
                  router.push(intentResult.actionHref);
                  onClose();
                }}
                className="btn-comic btn-comic-black text-xs px-3 py-1.5 font-black inline-flex items-center gap-1.5"
              >
                <span>{intentResult.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[55vh]">
          
          {/* Empty Query State: Show Recent Searches & Favorites */}
          {!query.trim() && (
            <div className="space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="bg-white comic-border p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase text-black font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#FF9F43]" />
                      <span>RECENT SEARCHES</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] font-bold text-gray-500 hover:text-red-600 underline font-mono"
                    >
                      CLEAR HISTORY
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sound.playPop();
                          setQuery(term);
                        }}
                        className="bg-[#FFFDF5] comic-border-sm hover:bg-[#FFD83D] text-black font-bold text-xs px-2.5 py-1 rounded-lg transition-all"
                      >
                        🔍 {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites & Quick Actions */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#FFD83D] fill-[#FFD83D]" />
                  <span>FAVORITE TOOLS & QUICK COMMANDS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {EXACT_18_TOOLS.slice(0, 6).map((tool) => {
                    const IconComp = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          sound.playPop();
                          router.push(tool.href);
                          onClose();
                        }}
                        className="p-2.5 bg-white comic-border-sm shadow-comic-sm hover:bg-[#FFD83D] transition-colors flex items-center justify-between text-left font-bold text-xs rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded border border-black" style={{ backgroundColor: tool.hexColor }}>
                            <IconComp className="w-4 h-4 text-black stroke-[2.5]" />
                          </div>
                          <div>
                            <span className="block font-black text-black">{tool.name}</span>
                            <span className="block text-[10px] text-gray-500 font-mono">{tool.heroIdentity}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-mono rounded">
                          {tool.issueNo}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Non-Empty Search Query Results Grouped by Category */}
          {query.trim() && Object.keys(groupedResults).length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedResults).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <div className="text-xs font-black font-mono uppercase tracking-wider text-black bg-[#FFD83D] comic-border-sm px-2 py-0.5 inline-block">
                    {category} ({items.length})
                  </div>

                  <div className="space-y-1.5">
                    {items.map((item) => {
                      const currentIndex = globalIndexCounter++;
                      const isSelected = currentIndex === selectedIndex;
                      const IconComp = item.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            sound.playPop();
                            addRecentSearch(query);
                            router.push(item.href);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`p-3 comic-border-sm rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#FFD83D] border-3 border-black shadow-comic-md translate-x-1 font-black'
                              : 'bg-white hover:bg-[#FFFDF5] shadow-comic-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black text-white comic-border-sm shrink-0">
                              <IconComp className="w-4 h-4 stroke-[2.5]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm uppercase text-black">
                                  {item.title}
                                </h4>
                                <span className="text-[9px] font-mono font-bold bg-gray-100 text-black px-1.5 py-0.5 border border-black rounded">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected && (
                              <span className="hidden sm:inline font-mono text-[9px] font-black bg-black text-white px-1.5 py-0.5 rounded">
                                ENTER ↵
                              </span>
                            )}
                            <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-black stroke-[3]' : 'text-gray-400'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results Fallback */}
          {query.trim() && Object.keys(groupedResults).length === 0 && !intentResult && (
            <div className="bg-white comic-border p-6 rounded-2xl text-center space-y-4">
              <div className="inline-block p-3 bg-[#FF5A5F] comic-border-sm rounded-full text-white">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase text-black">
                  NO MATCH FOUND
                </h3>
                <div className="speech-bubble inline-block bg-[#FFD83D] text-black font-black text-xs px-3 py-1 border-2 border-black rounded-lg">
                  💬 &quot;HMM... THAT ONE ESCAPED.&quot;
                </div>
                <p className="text-xs font-bold text-gray-600 max-w-sm mx-auto pt-1">
                  We couldn&apos;t find an exact item matching &quot;{query}&quot;. Ask DEION HUB AI to assist or request a new tool!
                </p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={triggerAiFallback}
                  disabled={aiLoading}
                  className="btn-comic btn-comic-red text-xs px-4 py-2 font-black inline-flex items-center gap-1.5"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>CONSULTING AI...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>[ ASK AI ]</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    sound.playPop();
                    alert(`Request received for tool "${query}". Added to DEIONS HUB product wishlist!`);
                  }}
                  className="btn-comic btn-comic-yellow text-xs px-4 py-2 font-black inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>[ REQUEST A TOOL ]</span>
                </button>

                <button
                  onClick={() => {
                    sound.playPop();
                    setQuery('');
                  }}
                  className="btn-comic btn-comic-white text-xs px-4 py-2 font-black inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>[ CLEAR SEARCH ]</span>
                </button>
              </div>

              {/* AI Response Panel */}
              {aiResult && (
                <div className="mt-4 text-left bg-[#FFFDF5] comic-border p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b-2 border-black">
                    <span className="font-black text-xs font-mono uppercase text-black flex items-center gap-1">
                      <Bot className="w-4 h-4 text-[#FF5A5F]" />
                      DEION HUB AI DETECTIVE RESPONSE
                    </span>
                  </div>
                  <p className="text-xs font-bold text-black leading-relaxed">
                    {aiResult}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Shortcut Bar */}
        <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[11px] font-mono font-bold text-gray-600">
          <span>UP/DOWN to select • ENTER to launch</span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
}
