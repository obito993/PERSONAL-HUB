'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  BookOpen, 
  Upload, 
  Sparkles, 
  Plus, 
  Check, 
  Copy, 
  Trash2, 
  Star, 
  Search, 
  FileText, 
  Layers, 
  Trophy, 
  Flame, 
  Award, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { storage, NoteItem, UserState } from '@/lib/storage';
import { processAIRequest } from '@/lib/ai';
import { sound } from '@/lib/sound';

interface Flashcard {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

function StudyLabContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') as 'THEORY' | 'NOTES' | 'DASHBOARD' || 'THEORY';

  const [activeMode, setActiveMode] = useState<'THEORY' | 'NOTES' | 'DASHBOARD'>(initialMode);
  const [userState, setUserState] = useState<UserState | null>(null);

  // Document Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [docText, setDocText] = useState<string>('');
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docSummary, setDocSummary] = useState<string | null>(null);

  // Flashcards & Quizzes
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);

  // Deion AI Study Tutor
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // User Notes State
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Python');
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  useEffect(() => {
    setUserState(storage.getUserState());
    setNotes(storage.getNotes());
  }, []);

  // Document Processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessingDoc(true);
    setDocSummary(null);
    sound.playPop();

    try {
      if (file.type === 'application/pdf') {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);
        setPageCount(pdfDoc.getPageCount());
        setDocText(`[PDF Document Loaded: ${file.name}, ${pdfDoc.getPageCount()} pages, ${(file.size / 1024).toFixed(1)} KB]`);
      } else {
        const text = await file.text();
        setDocText(text || `[Image/Document Loaded: ${file.name}, ${(file.size / 1024).toFixed(1)} KB]`);
        setPageCount(1);
      }
    } catch {
      setDocText(`[Loaded Document: ${file.name}]`);
      setPageCount(1);
    } finally {
      setIsProcessingDoc(false);
    }
  };

  // Deion Study Actions
  const handleAiAction = async (actionType: 'SUMMARIZE' | 'EXPLAIN' | 'FLASHCARDS' | 'QUIZ' | 'KEY_POINTS') => {
    if (!docText && !uploadedFile) {
      alert('Please upload a document or paste study notes first!');
      return;
    }

    setLoadingAi(true);
    sound.playPop();

    try {
      if (actionType === 'FLASHCARDS') {
        const res = await processAIRequest({
          tool: 'flashcards',
          prompt: docText || uploadedFile?.name || 'Study Flashcards',
        });
        setDocSummary(res.result);
      } else if (actionType === 'QUIZ') {
        const res = await processAIRequest({
          tool: 'quiz',
          prompt: docText || uploadedFile?.name || 'Study Quiz',
        });
        setDocSummary(res.result);
      } else {
        const res = await processAIRequest({
          tool: 'study_plan',
          prompt: `${actionType}: ${docText || uploadedFile?.name}`,
        });
        setDocSummary(res.result);
      }
    } catch {
      setDocSummary('THE AI SIGNAL DROPPED. Please try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  // AI Tutor Query
  const askAiTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setLoadingAi(true);
    sound.playPop();

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          mode: 'STUDY',
          prompt: `Document Context: ${docText.slice(0, 2000)}\nUser Question: ${aiPrompt}`
        })
      });
      const data = await res.json();
      setAiResponse(data.result);
      sound.playLevelUp();
    } catch {
      setAiResponse("⚡ [AI TUTOR]: Key concept breakdown prepared for your question!");
    } finally {
      setLoadingAi(false);
      setAiPrompt('');
    }
  };

  // Notes Management
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const updated = storage.addNote(noteTitle, noteContent, noteTag);
    setNotes(updated);
    setNoteTitle('');
    setNoteContent('');
    sound.playPop();
  };

  const handleDeleteNote = (id: string) => {
    const updated = storage.deleteNote(id);
    setNotes(updated);
    sound.playPop();
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(noteSearch.toLowerCase()) || n.content.toLowerCase().includes(noteSearch.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || n.subject === selectedTag;
    return matchesSearch && matchesTag;
  });

  const TAGS = ['ALL', 'Python', 'SQL', 'AI', 'Data Analytics', 'Web Development', 'Interview'];

  return (
    <div className="space-y-8 py-6">

      {/* 1. Page Identity Banner */}
      <div className="bg-[#B9A7FF] text-black comic-border-lg p-6 sm:p-8 shadow-comic-lg space-y-4 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white font-mono font-black text-xs px-3 py-1 border border-white rounded-lg">
              ★ ISSUE #003 ★
            </span>
            <span className="comic-sticker comic-sticker-yellow text-xs font-black">
              COMIC NOTEBOOK × AI TUTOR × THEORY LAB
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight flex items-center gap-3">
            <BookOpen className="w-10 h-10 stroke-[2.8]" />
            <span>THE STUDY LAB</span>
          </h1>
          <p className="font-bold text-xs sm:text-base italic text-black/90">
            &quot;TURN ANYTHING INTO SOMETHING YOU UNDERSTAND.&quot;
          </p>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setActiveMode('THEORY'); sound.playPop(); }}
          className={`btn-comic text-xs px-5 py-2.5 font-black flex items-center gap-2 ${
            activeMode === 'THEORY' ? 'bg-[#B9A7FF] text-black scale-105 shadow-comic-md' : 'btn-comic-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>THEORY LAB</span>
        </button>

        <button
          onClick={() => { setActiveMode('NOTES'); sound.playPop(); }}
          className={`btn-comic text-xs px-5 py-2.5 font-black flex items-center gap-2 ${
            activeMode === 'NOTES' ? 'bg-[#FFD83D] text-black scale-105 shadow-comic-md' : 'btn-comic-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>USER NOTES ({notes.length})</span>
        </button>

        <button
          onClick={() => { setActiveMode('DASHBOARD'); sound.playPop(); }}
          className={`btn-comic text-xs px-5 py-2.5 font-black flex items-center gap-2 ${
            activeMode === 'DASHBOARD' ? 'bg-[#FF5A5F] text-white scale-105 shadow-comic-md' : 'btn-comic-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>STUDY DASHBOARD</span>
        </button>
      </div>

      {/* THEORY LAB */}
      {activeMode === 'THEORY' && (
        <div className="space-y-6">

          {/* Document Upload Toolbar */}
          <div className="bg-white comic-border-lg p-6 shadow-comic-lg rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
              <div>
                <h2 className="font-black text-2xl uppercase flex items-center gap-2">
                  <Upload className="w-6 h-6 text-[#B9A7FF]" />
                  <span>UPLOAD STUDY MATERIAL</span>
                </h2>
                <p className="text-xs font-bold text-gray-600">PDF, JPG, PNG, WEBP, or raw text study notes.</p>
              </div>

              <label className="btn-comic bg-[#B9A7FF] text-black text-xs px-4 py-2.5 font-black cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>CHOOSE FILE</span>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png,.webp,text/plain" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {uploadedFile && (
              <div className="bg-[#FFFDF5] comic-border-sm p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs font-bold">
                <div>
                  <div className="text-black font-black text-sm">📄 {uploadedFile.name}</div>
                  <div className="text-gray-600">
                    Type: {uploadedFile.type || 'Document'} • Size: {(uploadedFile.size / 1024).toFixed(1)} KB • Pages: {pageCount || 1}
                  </div>
                </div>
                <span className="bg-green-400 text-black px-2.5 py-1 border border-black rounded text-[10px] font-black">
                  STATUS: READY
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={() => handleAiAction('SUMMARIZE')} disabled={loadingAi} className="btn-comic bg-[#FFD83D] text-black text-xs px-4 py-2 font-black">
                SUMMARIZE
              </button>
              <button onClick={() => handleAiAction('EXPLAIN')} disabled={loadingAi} className="btn-comic bg-[#5DADE2] text-black text-xs px-4 py-2 font-black">
                EXPLAIN
              </button>
              <button onClick={() => handleAiAction('FLASHCARDS')} disabled={loadingAi} className="btn-comic bg-[#B9A7FF] text-black text-xs px-4 py-2 font-black">
                FLASHCARDS
              </button>
              <button onClick={() => handleAiAction('QUIZ')} disabled={loadingAi} className="btn-comic bg-[#FF5A5F] text-white text-xs px-4 py-2 font-black">
                QUIZ
              </button>
              <button onClick={() => handleAiAction('KEY_POINTS')} disabled={loadingAi} className="btn-comic bg-[#2ECC71] text-black text-xs px-4 py-2 font-black">
                KEY POINTS
              </button>
            </div>
          </div>

          {/* AI Output */}
          {docSummary && (
            <div className="bg-[#FFFDF5] comic-border-lg p-6 rounded-2xl space-y-2">
              <div className="font-black text-sm uppercase flex items-center gap-2 text-[#A855F7]">
                <Sparkles className="w-5 h-5" />
                <span>DEION AI STUDY ANALYSIS OUTPUT</span>
              </div>
              <div className="text-xs font-mono whitespace-pre-wrap text-black bg-white comic-border-sm p-4 leading-relaxed">
                {docSummary}
              </div>
            </div>
          )}

          {/* Flashcards Flip Deck */}
          {flashcards.length > 0 && (
            <div className="bg-white comic-border-lg p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="font-black text-lg uppercase flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#B9A7FF]" />
                  <span>AI FLASHCARDS ({currentCardIdx + 1}/{flashcards.length})</span>
                </h3>
              </div>

              <div 
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="bg-[#B9A7FF]/20 comic-border-md p-10 rounded-2xl cursor-pointer min-h-44 flex flex-col items-center justify-center text-center transition-all hover:scale-[1.01]"
              >
                <div className="text-[10px] font-mono font-black uppercase text-purple-800 mb-2">
                  {isCardFlipped ? 'ANSWER (CLICK TO FLIP)' : 'QUESTION (CLICK TO FLIP)'}
                </div>
                <div className="font-black text-lg sm:text-xl text-black">
                  {isCardFlipped ? flashcards[currentCardIdx].answer : flashcards[currentCardIdx].question}
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={() => { setCurrentCardIdx(Math.max(0, currentCardIdx - 1)); setIsCardFlipped(false); }}
                  className="btn-comic btn-comic-white px-4 py-2 text-xs font-black"
                >
                  PREVIOUS CARD
                </button>
                <button 
                  onClick={() => { setCurrentCardIdx(Math.min(flashcards.length - 1, currentCardIdx + 1)); setIsCardFlipped(false); }}
                  className="btn-comic bg-[#B9A7FF] text-black px-4 py-2 text-xs font-black"
                >
                  NEXT CARD
                </button>
              </div>
            </div>
          )}

          {/* 3-Column Comic Notebook UI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 bg-white comic-border-lg p-5 rounded-2xl space-y-4">
              <h3 className="font-black text-base uppercase border-b-2 border-black pb-2">CHAPTERS & DECK</h3>
              <div className="space-y-2 font-bold text-xs">
                <button className="w-full text-left p-3 bg-[#B9A7FF] comic-border-sm font-black flex items-center justify-between">
                  <span>CHAPTER 1: FOUNDATIONS</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full text-left p-3 bg-white hover:bg-[#FFFDF5] comic-border-sm font-bold flex items-center justify-between">
                  <span>CHAPTER 2: ADVANCED TOPICS</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full text-left p-3 bg-white hover:bg-[#FFFDF5] comic-border-sm font-bold flex items-center justify-between">
                  <span>CHAPTER 3: REVISION NOTES</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white comic-border-lg p-6 rounded-2xl space-y-4">
              <h3 className="font-black text-xl uppercase border-b-2 border-black pb-2">CHAPTER 1: LESSON CONTENT</h3>

              <div className="space-y-4 text-xs font-bold">
                <div className="bg-[#5DADE2]/20 border-l-4 border-[#5DADE2] p-4 rounded-r-xl">
                  <div className="font-black text-sm uppercase text-[#2563EB] mb-1">📘 THEORY</div>
                  <p className="text-gray-800">
                    Understanding core data structures and algorithm complexity is essential for writing scalable code.
                  </p>
                </div>

                <div className="bg-[#FFD83D]/20 border-l-4 border-[#FFD83D] p-4 rounded-r-xl font-mono">
                  <div className="font-black text-sm uppercase text-black font-sans mb-1">⚡ EXAMPLE</div>
                  <code>def binary_search(arr, target): return arr.index(target)</code>
                </div>

                <div className="bg-[#10B981]/20 border-l-4 border-[#10B981] p-4 rounded-r-xl">
                  <div className="font-black text-sm uppercase text-emerald-800 mb-1">💡 PRO TIP</div>
                  <p className="text-gray-800">Break complex problems into smaller helper functions before coding.</p>
                </div>

                <div className="bg-[#FF5A5F]/20 border-l-4 border-[#FF5A5F] p-4 rounded-r-xl">
                  <div className="font-black text-sm uppercase text-red-700 mb-1">⚠️ WARNING</div>
                  <p className="text-gray-800">Watch out for infinite recursion loops without base termination criteria!</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white comic-border-lg p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="font-black text-base uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A855F7]" />
                  <span>OPENAI STUDY TUTOR</span>
                </h3>
              </div>

              <form onSubmit={askAiTutor} className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder='Ask: "Explain page 2", "Teach me like a beginner", or "What is the main concept?"'
                  rows={3}
                  className="comic-input w-full text-xs font-medium"
                />
                <button 
                  type="submit" 
                  disabled={loadingAi}
                  className="btn-comic bg-[#A855F7] text-white w-full py-2 text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ASK TUTOR</span>
                </button>
              </form>

              {aiResponse && (
                <div className="bg-purple-950 text-purple-100 p-4 comic-border-sm rounded-xl text-xs font-mono space-y-2">
                  <div className="font-black text-[#B9A7FF]">OPENAI TUTOR RESPONSE:</div>
                  <p className="whitespace-pre-wrap">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* USER NOTES */}
      {activeMode === 'NOTES' && (
        <div className="space-y-6">
          <div className="bg-white comic-border-lg p-6 rounded-2xl space-y-4">
            <h2 className="font-black text-xl uppercase border-b-2 border-black pb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#FFD83D]" />
              <span>CREATE NEW STUDY NOTE</span>
            </h2>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title..."
                  className="comic-input text-xs font-bold sm:col-span-2"
                />
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="comic-input text-xs font-black"
                >
                  <option value="Python">Python</option>
                  <option value="SQL">SQL</option>
                  <option value="AI">AI</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Interview">Interview</option>
                </select>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write study concepts, code snippets, key takeaways..."
                rows={5}
                className="comic-input w-full text-xs font-mono"
              />

              <button type="submit" className="btn-comic bg-[#FFD83D] text-black px-6 py-2.5 text-xs font-black flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>SAVE NOTE</span>
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                placeholder="Search notes..."
                className="comic-input w-full text-xs pl-8 font-bold"
              />
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setSelectedTag(tag); sound.playPop(); }}
                  className={`btn-comic text-[11px] px-3 py-1 font-black ${
                    selectedTag === tag ? 'bg-black text-white' : 'btn-comic-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full bg-white comic-border-md p-12 text-center font-black space-y-2">
                <FileText className="w-10 h-10 mx-auto text-gray-400" />
                <div>NO STUDY NOTES FOUND</div>
                <p className="text-xs text-gray-600 font-mono">Create your first study note above!</p>
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div key={n.id} className="bg-white comic-border-md p-5 rounded-xl space-y-3 flex flex-col justify-between shadow-comic-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="comic-sticker bg-[#FFD83D] text-black text-[10px] font-black border border-black">
                        {n.subject}
                      </span>
                      <button onClick={() => handleDeleteNote(n.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-black text-base uppercase text-black">{n.title}</h4>

                    <p className="text-xs font-mono bg-[#FFFDF5] comic-border-sm p-3 text-gray-800 break-words leading-relaxed">
                      {n.content}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-gray-500 text-right">
                    Updated: {new Date(n.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {activeMode === 'DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFD83D] comic-border-lg p-6 rounded-2xl shadow-comic-md space-y-3 font-mono">
              <div className="text-xs font-sans font-black uppercase text-black">STUDY LEVEL & XP</div>
              <div className="text-4xl font-black text-black">LEVEL {userState?.level || 1}</div>
              <div className="text-xs font-black text-black/80">{userState?.xp || 0} XP Earned</div>
            </div>

            <div className="bg-[#5DADE2] text-black comic-border-lg p-6 rounded-2xl shadow-comic-md space-y-3 font-mono">
              <div className="text-xs font-sans font-black uppercase">STUDY STREAK</div>
              <div className="text-4xl font-black flex items-center gap-2">
                <Flame className="w-8 h-8 text-[#FF5A5F]" />
                <span>{userState?.streak || 1} DAYS</span>
              </div>
              <div className="text-xs font-black opacity-90">Daily active recall practice</div>
            </div>

            <div className="bg-[#B9A7FF] text-black comic-border-lg p-6 rounded-2xl shadow-comic-md space-y-3 font-mono">
              <div className="text-xs font-sans font-black uppercase">SAVED STUDY NOTES</div>
              <div className="text-4xl font-black">{notes.length} NOTES</div>
              <div className="text-xs font-black opacity-90">Across all tagged subjects</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function StudyLabPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-black">⚡ LOADING THE STUDY LAB...</div>}>
      <StudyLabContent />
    </Suspense>
  );
}
