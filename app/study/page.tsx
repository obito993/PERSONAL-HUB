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
  ArrowRight,
  RotateCw,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Download,
  Menu,
  X
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface StudyChapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  summaryJson?: string;
  explanationText?: string;
  keyPointsJson?: string;
}

interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  chapters: StudyChapter[];
  progress: any[];
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  cardType: string;
  mastered: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  sourceSection?: string;
  userAnswer?: number | null;
  isCorrect?: boolean | null;
}

interface KeyPoint {
  category: 'IMPORTANT' | 'DEFINITION' | 'FORMULA' | 'CONCEPT' | 'EXAMPLE' | 'REMEMBER';
  point: string;
  importance: 'high' | 'medium';
}

type ModeType = 'SUMMARIZE' | 'EXPLAIN' | 'FLASHCARDS' | 'QUIZ' | 'KEY_POINTS';

function StudyPlatformContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get('docId') || '';

  // App State
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<StudyDocument | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ALL'); // 'ALL' or chapter ID
  const [activeMode, setActiveMode] = useState<ModeType>('SUMMARIZE');
  
  // UI & Loading
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoadingMode, setIsLoadingMode] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Content per mode
  const [summaryText, setSummaryText] = useState<string>('');
  const [explanationText, setExplanationText] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [quizComplete, setQuizComplete] = useState(false);

  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [keyPointFilter, setKeyPointFilter] = useState('ALL');

  // AI Tutor Ask box
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState('');
  const [loadingTutor, setLoadingTutor] = useState(false);

  // Initial Load
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/study/documents');
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        setDocuments(data.documents);
        const docToSelect = initialDocId 
          ? data.documents.find((d: any) => d.id === initialDocId) || data.documents[0]
          : data.documents[0];
        fetchDocumentDetails(docToSelect.id);
      }
    } catch (err) {
      console.error('Error fetching study documents:', err);
    }
  };

  const fetchDocumentDetails = async (docId: string) => {
    try {
      const res = await fetch(`/api/study/documents/${docId}`);
      const data = await res.json();
      if (data.document) {
        setActiveDoc(data.document);
        loadModeContent(data.document.id, selectedChapterId, activeMode);
      }
    } catch (err) {
      console.error('Error fetching document details:', err);
    }
  };

  // Upload PDF Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Extracting PDF text...');
    sound.playPop();

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadStatus('Detecting semantic chapters...');
      const res = await fetch('/api/study/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        // Stale session: userId in JWT cookie doesn't match any user in the database
        if (data.code === 'SESSION_USER_NOT_FOUND' || res.status === 401) {
          const confirmed = window.confirm(
            '⚠️ Your session has expired.\n\nYou need to log out and log back in to upload PDFs.\n\nClick OK to log out now.'
          );
          if (confirmed) {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }
          return;
        }
        alert(data.error || 'Failed to process PDF');
        return;
      }

      sound.playLevelUp();
      await fetchDocuments();
      if (data.document) {
        setActiveDoc(data.document);
        setSelectedChapterId('ALL');
        loadModeContent(data.document.id, 'ALL', activeMode);
      }
    } catch (err) {
      alert('Error uploading PDF file');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  // Load Content for selected (docId, chapterId, mode)
  const loadModeContent = async (docId: string, chapterId: string, mode: ModeType, forceRefresh = false) => {
    if (!docId) return;

    setIsLoadingMode(true);
    setTutorAnswer('');
    sound.playPop();

    try {
      const res = await fetch('/api/study/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: docId,
          chapterId: chapterId === 'ALL' ? null : chapterId,
          mode,
          forceRefresh,
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        console.error('Generate error:', data.error);
        setIsLoadingMode(false);
        return;
      }

      if (mode === 'SUMMARIZE') {
        setSummaryText(data.result || 'No summary available.');
      } else if (mode === 'EXPLAIN') {
        setExplanationText(data.result || 'No explanation available.');
      } else if (mode === 'FLASHCARDS') {
        setFlashcards(data.cards || []);
        setCurrentCardIdx(0);
        setIsCardFlipped(false);
      } else if (mode === 'QUIZ') {
        const qList: QuizQuestion[] = data.questions || [];
        setQuizQuestions(qList);
        setCurrentQuizIdx(0);
        setSelectedQuizOption(null);
        setQuizSubmitted(false);
        setQuizComplete(false);
        const correctCount = qList.filter(q => q.isCorrect === true).length;
        setQuizScore({ correct: correctCount, total: qList.length });
      } else if (mode === 'KEY_POINTS') {
        setKeyPoints(data.keyPoints || []);
      }
    } catch (err) {
      console.error('Error loading mode content:', err);
    } finally {
      setIsLoadingMode(false);
    }
  };

  // Select Chapter
  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setMobileDrawerOpen(false);
    if (activeDoc) {
      loadModeContent(activeDoc.id, chapterId, activeMode);
    }
  };

  // Change Mode Tab
  const handleChangeMode = (mode: ModeType) => {
    setActiveMode(mode);
    if (activeDoc) {
      loadModeContent(activeDoc.id, selectedChapterId, mode);
    }
  };

  // Flashcard Mastery Toggle
  const handleToggleCardMastery = async (cardId: string, currentMastered: boolean) => {
    sound.playPop();
    const nextMastered = !currentMastered;
    setFlashcards(prev => prev.map(c => c.id === cardId ? { ...c, mastered: nextMastered } : c));

    try {
      await fetch('/api/study/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: activeDoc?.id,
          chapterId: selectedChapterId === 'ALL' ? null : selectedChapterId,
          type: 'FLASHCARD_MASTERY',
          cardId,
          mastered: nextMastered,
        })
      });
    } catch (err) {
      console.error('Mastery update error:', err);
    }
  };

  // Quiz Option Click
  const handleAnswerQuiz = async (optionIdx: number) => {
    if (quizSubmitted) return;

    setSelectedQuizOption(optionIdx);
    setQuizSubmitted(true);
    sound.playPop();

    const currentQ = quizQuestions[currentQuizIdx];
    const isCorrect = optionIdx === currentQ.correctAnswer;

    if (isCorrect) sound.playLevelUp();

    setQuizScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    try {
      await fetch('/api/study/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: activeDoc?.id,
          chapterId: selectedChapterId === 'ALL' ? null : selectedChapterId,
          type: 'QUIZ_SUBMISSION',
          questionId: currentQ.id,
          userAnswer: optionIdx,
          score: quizScore.correct + (isCorrect ? 1 : 0),
          total: quizScore.total + 1,
        })
      });
    } catch (err) {
      console.error('Quiz submission error:', err);
    }
  };

  // Quiz Next Question
  const handleNextQuizQuestion = () => {
    sound.playPop();
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      setSelectedQuizOption(null);
      setQuizSubmitted(false);
    } else {
      setQuizComplete(true);
    }
  };

  // AI Tutor Submit
  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim() || !activeDoc) return;

    setLoadingTutor(true);
    sound.playPop();

    try {
      const selectedCh = activeDoc.chapters.find(c => c.id === selectedChapterId);
      const docContext = selectedCh ? selectedCh.content : activeDoc.title;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          mode: 'STUDY',
          prompt: `Document Context (${selectedCh ? selectedCh.title : 'Full Document'}):\n${docContext.slice(0, 3000)}\n\nStudent Question: ${tutorQuery}`
        })
      });
      const data = await res.json();
      setTutorAnswer(data.result || 'No response returned.');
      sound.playLevelUp();
    } catch (err) {
      setTutorAnswer('⚡ Could not connect to AI Tutor right now.');
    } finally {
      setLoadingTutor(false);
      setTutorQuery('');
    }
  };

  const selectedChapterName = selectedChapterId === 'ALL' 
    ? 'ALL CHAPTERS (FULL PDF)'
    : activeDoc?.chapters.find(c => c.id === selectedChapterId)?.title || 'Chapter';

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Top Header & Document Controls */}
      <div className="bg-[#FFD83D] comic-border-lg shadow-comic-lg p-6 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="comic-badge comic-badge-red text-xs">AI PDF LEARNING PLATFORM</span>
            <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5 rounded">PDF PARSER & CHUNK ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-1">
            {activeDoc ? activeDoc.title : 'STUDY HUB'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-800 font-mono mt-1">
            {activeDoc 
              ? `📄 ${activeDoc.fileName} • ${activeDoc.chapters.length} Chapters Detected • ${activeDoc.pageCount} Pages`
              : 'Upload any PDF textbook, paper, or notes to generate structured summaries, explanations, flashcards, quizzes & key points.'}
          </p>
        </div>

        {/* Upload Dropzone / Doc Switcher */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          {documents.length > 0 && (
            <select
              value={activeDoc?.id || ''}
              onChange={(e) => {
                const doc = documents.find(d => d.id === e.target.value);
                if (doc) {
                  setActiveDoc(doc);
                  setSelectedChapterId('ALL');
                  fetchDocumentDetails(doc.id);
                }
              }}
              className="bg-white comic-border-sm px-3 py-2 text-xs font-black uppercase rounded shadow-comic-sm focus:outline-none"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>📄 {d.title}</option>
              ))}
            </select>
          )}

          <label className="bg-black hover:bg-[#FF5A5F] text-[#FFD83D] hover:text-white comic-border-sm px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-comic-sm transition-all shrink-0">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? uploadStatus : 'UPLOAD PDF'}</span>
            <input 
              type="file" 
              accept=".pdf,application/pdf" 
              onChange={handleFileUpload} 
              disabled={isUploading}
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Main Study Workspace (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT CHAPTER NAVIGATION PANEL (Desktop + Mobile Drawer) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Mobile Drawer Toggle */}
          <div className="lg:hidden flex items-center justify-between bg-white comic-border-md p-3">
            <span className="font-black text-xs uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <span>SELECTED: {selectedChapterName}</span>
            </span>
            <button 
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="bg-[#FFD83D] comic-border-sm p-1.5 font-black text-xs"
            >
              {mobileDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          <div className={`bg-white comic-border-lg shadow-comic-lg p-4 space-y-3 ${mobileDrawerOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-black text-sm uppercase flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>CHAPTER NAVIGATION</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#FFD83D] px-2 py-0.5 border border-black rounded">
                {activeDoc?.chapters.length || 0} SECTIONS
              </span>
            </div>

            {/* ALL CHAPTERS BUTTON */}
            <button
              onClick={() => handleSelectChapter('ALL')}
              className={`w-full text-left p-3 border-2 font-black text-xs uppercase transition-all flex items-center justify-between ${
                selectedChapterId === 'ALL'
                  ? 'bg-[#FF5A5F] text-white border-black shadow-comic-sm translate-x-1'
                  : 'bg-[#FFFDF5] hover:bg-[#FFD83D] border-black text-black'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span>ALL CHAPTERS (FULL PDF)</span>
              </div>
              <span className="text-[10px] font-mono bg-black text-white px-1.5 py-0.5 rounded">FULL</span>
            </button>

            {/* CHAPTER LIST */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {activeDoc?.chapters.map((ch) => {
                const isSelected = selectedChapterId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch.id)}
                    className={`w-full text-left p-2.5 border-2 transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#FFD83D] border-black shadow-comic-sm font-black translate-x-1'
                        : 'bg-white hover:bg-yellow-50 border-gray-300 text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase line-clamp-1">
                        {ch.title}
                      </span>
                      {isSelected && <ChevronRight className="w-4 h-4 shrink-0" />}
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-gray-600">
                      <span className={ch.summaryJson ? 'text-green-600 font-extrabold' : ''}>
                        {ch.summaryJson ? '✓ Summary' : '○ Summary'}
                      </span>
                      <span>•</span>
                      <span className={ch.explanationText ? 'text-green-600 font-extrabold' : ''}>
                        {ch.explanationText ? '✓ Explain' : '○ Explain'}
                      </span>
                      <span>•</span>
                      <span className={ch.keyPointsJson ? 'text-green-600 font-extrabold' : ''}>
                        {ch.keyPointsJson ? '✓ Key Points' : '○ Key Points'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI TUTOR QUICK QUESTION BOX */}
          <div className="bg-[#B9A7FF] comic-border-lg shadow-comic-lg p-4 space-y-3">
            <h4 className="font-black text-xs uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-black" />
              <span>DEION AI TUTOR</span>
            </h4>
            <form onSubmit={handleAskTutor} className="space-y-2">
              <input
                type="text"
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                placeholder={`Ask about ${selectedChapterName}...`}
                className="w-full bg-white comic-border-sm p-2 text-xs font-mono font-bold focus:outline-none"
              />
              <button
                type="submit"
                disabled={loadingTutor}
                className="w-full bg-black text-white hover:bg-gray-800 comic-border-sm p-1.5 font-black text-xs uppercase tracking-wider transition-colors"
              >
                {loadingTutor ? 'AI THINKING...' : 'ASK TUTOR'}
              </button>
            </form>

            {tutorAnswer && (
              <div className="bg-white comic-border-sm p-3 font-mono text-xs text-gray-900 max-h-48 overflow-y-auto space-y-1">
                <div className="font-black text-[10px] text-purple-700 uppercase">⚡ TUTOR RESPONSE:</div>
                <p className="whitespace-pre-line leading-relaxed">{tutorAnswer}</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT MAIN STUDY WORKSPACE */}
        <div className="lg:col-span-8 space-y-4">

          {/* 5 MODE SELECTION TABS */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {(['SUMMARIZE', 'EXPLAIN', 'FLASHCARDS', 'QUIZ', 'KEY_POINTS'] as ModeType[]).map((mode) => {
              const isActive = activeMode === mode;
              const labels: Record<ModeType, string> = {
                SUMMARIZE: 'SUMMARY',
                EXPLAIN: 'EXPLAIN',
                FLASHCARDS: 'CARDS',
                QUIZ: 'QUIZ',
                KEY_POINTS: 'KEY POINTS',
              };

              return (
                <button
                  key={mode}
                  onClick={() => handleChangeMode(mode)}
                  className={`py-2.5 px-1 sm:px-3 border-2 font-black text-[10px] sm:text-xs uppercase tracking-tight transition-all text-center rounded-t-lg ${
                    isActive
                      ? 'bg-[#FFD83D] border-black shadow-comic-sm font-black translate-y-[-2px]'
                      : 'bg-white hover:bg-yellow-100 border-gray-400 text-black'
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>

          {/* MAIN VIEWPORT CONTAINER */}
          <div className="bg-white comic-border-lg shadow-comic-lg p-6 min-h-[500px] relative">

            {/* Loading Overlay */}
            {isLoadingMode && (
              <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-black border-t-[#FF5A5F] rounded-full animate-spin" />
                <div className="comic-badge comic-badge-yellow font-black text-xs animate-bounce">
                  PROCESSING {activeMode} FOR {selectedChapterName}...
                </div>
                <p className="font-mono text-xs text-gray-700">
                  Synthesizing PDF content through Ollama → Gemini → Groq fallback pipeline...
                </p>
              </div>
            )}

            {/* MODE 1: SUMMARIZE */}
            {activeMode === 'SUMMARIZE' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div>
                    <h2 className="font-black text-xl uppercase">STUDY SUMMARY</h2>
                    <span className="font-mono text-xs font-bold text-gray-700">
                      Scope: {selectedChapterName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => activeDoc && loadModeContent(activeDoc.id, selectedChapterId, 'SUMMARIZE', true)}
                      className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm"
                      title="Generate new fresh summary with AI"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>REGENERATE NEW</span>
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(summaryText)}
                      className="bg-gray-100 hover:bg-gray-200 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1"
                      title="Copy Summary"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">COPY</span>
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none font-sans text-sm text-gray-900 leading-relaxed whitespace-pre-line space-y-3">
                  {summaryText || 'Click generate to load chapter summary.'}
                </div>
              </div>
            )}

            {/* MODE 2: EXPLAIN */}
            {activeMode === 'EXPLAIN' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div>
                    <h2 className="font-black text-xl uppercase">TEACHER-STYLE BREAKDOWN</h2>
                    <span className="font-mono text-xs font-bold text-gray-700">
                      Simplified concepts & step-by-step explanations for {selectedChapterName}
                    </span>
                  </div>
                  <button
                    onClick={() => activeDoc && loadModeContent(activeDoc.id, selectedChapterId, 'EXPLAIN', true)}
                    className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm shrink-0 ml-2"
                    title="Generate new fresh explanation with AI"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>REGENERATE NEW</span>
                  </button>
                </div>

                <div className="bg-[#FFFDF5] comic-border-sm p-4 font-sans text-sm text-gray-900 leading-relaxed whitespace-pre-line space-y-4">
                  {explanationText || 'Click generate to load teacher explanation.'}
                </div>
              </div>
            )}

            {/* MODE 3: FLASHCARDS */}
            {activeMode === 'FLASHCARDS' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div>
                    <h2 className="font-black text-xl uppercase">STUDY FLASHCARDS</h2>
                    <span className="font-mono text-xs font-bold text-gray-700">
                      {flashcards.length} Cards Generated • {flashcards.filter(c => c.mastered).length} Mastered
                    </span>
                  </div>
                  <button
                    onClick={() => activeDoc && loadModeContent(activeDoc.id, selectedChapterId, 'FLASHCARDS', true)}
                    className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm shrink-0 ml-2"
                    title="Generate new fresh flashcards with AI"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>REGENERATE NEW</span>
                  </button>
                </div>

                {flashcards.length > 0 ? (
                  <div className="max-w-md mx-auto space-y-4">
                    {/* 3D FLIP CARD */}
                    <div 
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className={`min-h-[220px] p-6 comic-border-lg cursor-pointer transition-all transform flex flex-col justify-between select-none ${
                        isCardFlipped 
                          ? 'bg-[#B9A7FF] text-black shadow-comic-lg' 
                          : 'bg-[#FFD83D] text-black shadow-comic-lg'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="bg-black text-white px-2 py-0.5 rounded uppercase">
                          CARD {currentCardIdx + 1} OF {flashcards.length}
                        </span>
                        <span className="bg-white text-black px-2 py-0.5 comic-border-sm uppercase">
                          {isCardFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}
                        </span>
                      </div>

                      <div className="my-auto text-center py-4">
                        <h3 className="font-black text-lg sm:text-xl uppercase leading-snug">
                          {isCardFlipped ? flashcards[currentCardIdx].answer : flashcards[currentCardIdx].question}
                        </h3>
                        <p className="text-[10px] font-mono font-bold text-gray-700 mt-2">
                          (TAP CARD TO FLIP)
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="bg-white text-black px-2 py-0.5 rounded border border-black uppercase text-[10px]">
                          TYPE: {flashcards[currentCardIdx].cardType}
                        </span>
                        {flashcards[currentCardIdx].mastered && (
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-black">
                            ✓ MASTERED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CARD NAVIGATION & MASTERY CONTROLS */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (currentCardIdx > 0) {
                            setCurrentCardIdx(prev => prev - 1);
                            setIsCardFlipped(false);
                            sound.playPop();
                          }
                        }}
                        disabled={currentCardIdx === 0}
                        className="bg-white hover:bg-gray-100 disabled:opacity-40 comic-border-sm px-3 py-2 text-xs font-black uppercase"
                      >
                        PREV
                      </button>

                      <button
                        onClick={() => handleToggleCardMastery(
                          flashcards[currentCardIdx].id, 
                          flashcards[currentCardIdx].mastered
                        )}
                        className={`comic-border-sm px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                          flashcards[currentCardIdx].mastered
                            ? 'bg-green-500 text-white'
                            : 'bg-[#FF5A5F] text-white hover:bg-red-600'
                        }`}
                      >
                        {flashcards[currentCardIdx].mastered ? '✓ MASTERED' : 'MARK MASTERED'}
                      </button>

                      <button
                        onClick={() => {
                          if (currentCardIdx < flashcards.length - 1) {
                            setCurrentCardIdx(prev => prev + 1);
                            setIsCardFlipped(false);
                            sound.playPop();
                          }
                        }}
                        disabled={currentCardIdx === flashcards.length - 1}
                        className="bg-white hover:bg-gray-100 disabled:opacity-40 comic-border-sm px-3 py-2 text-xs font-black uppercase"
                      >
                        NEXT
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-gray-700">No flashcards available yet.</p>
                )}
              </div>
            )}

            {/* MODE 4: QUIZ */}
            {activeMode === 'QUIZ' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div>
                    <h2 className="font-black text-xl uppercase">INTERACTIVE CHAPTER QUIZ</h2>
                    <span className="font-mono text-xs font-bold text-gray-700">
                      Score: {quizScore.correct} / {quizQuestions.length} Correct
                    </span>
                  </div>
                </div>

                {!quizComplete && quizQuestions.length > 0 ? (
                  <div className="space-y-5 max-w-2xl mx-auto">
                    {/* QUESTION TITLE */}
                    <div className="bg-[#FFFDF5] comic-border-md p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="bg-black text-[#FFD83D] px-2 py-0.5 rounded uppercase">
                          QUESTION {currentQuizIdx + 1} OF {quizQuestions.length}
                        </span>
                        <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded font-black">
                          {quizQuestions[currentQuizIdx].topic}
                        </span>
                      </div>
                      <h3 className="font-black text-base sm:text-lg uppercase text-black">
                        {quizQuestions[currentQuizIdx].question}
                      </h3>
                    </div>

                    {/* OPTIONS (A, B, C, D) */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {quizQuestions[currentQuizIdx].options.map((opt, oIdx) => {
                        const isSelected = selectedQuizOption === oIdx;
                        const isCorrectOption = oIdx === quizQuestions[currentQuizIdx].correctAnswer;

                        let btnStyle = 'bg-white hover:bg-yellow-50 border-black text-black';
                        if (quizSubmitted) {
                          if (isCorrectOption) {
                            btnStyle = 'bg-green-500 text-white border-black font-black shadow-comic-sm';
                          } else if (isSelected && !isCorrectOption) {
                            btnStyle = 'bg-red-500 text-white border-black font-black shadow-comic-sm';
                          } else {
                            btnStyle = 'bg-gray-100 border-gray-300 text-gray-400 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerQuiz(oIdx)}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-3.5 border-2 text-xs font-bold transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full border border-black bg-black text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {quizSubmitted && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-white shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* EXPLANATION FEEDBACK BOX */}
                    {quizSubmitted && (
                      <div className="bg-[#FFD83D] comic-border-md p-4 space-y-2">
                        <div className="font-black text-xs uppercase flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-black" />
                          <span>EXPLANATION:</span>
                        </div>
                        <p className="font-sans text-xs text-gray-900 leading-relaxed font-bold">
                          {quizQuestions[currentQuizIdx].explanation}
                        </p>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={handleNextQuizQuestion}
                            className="bg-black hover:bg-gray-800 text-white comic-border-sm px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1"
                          >
                            <span>{currentQuizIdx < quizQuestions.length - 1 ? 'NEXT QUESTION' : 'VIEW RESULTS'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : quizComplete ? (
                  /* CHAPTER QUIZ COMPLETE SUMMARY CARD */
                  <div className="bg-[#B9A7FF] comic-border-lg shadow-comic-lg p-8 text-center space-y-4 max-w-md mx-auto">
                    <div className="comic-badge comic-badge-yellow text-xs font-black animate-bounce mx-auto">
                      CHAPTER QUIZ COMPLETE!
                    </div>
                    <h2 className="font-black text-3xl uppercase">ACCURACY: {Math.round((quizScore.correct / Math.max(1, quizQuestions.length)) * 100)}%</h2>
                    <p className="font-mono text-xs font-bold text-gray-800">
                      Answered {quizScore.correct} of {quizQuestions.length} questions correctly.
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setCurrentQuizIdx(0);
                          setSelectedQuizOption(null);
                          setQuizSubmitted(false);
                          setQuizComplete(false);
                        }}
                        className="bg-black text-white comic-border-sm px-4 py-2 text-xs font-black uppercase"
                      >
                        RETAKE QUIZ
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="font-mono text-xs text-gray-700">No quiz questions generated yet.</p>
                )}
              </div>
            )}

            {/* MODE 5: KEY POINTS */}
            {activeMode === 'KEY_POINTS' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
                  <div>
                    <h2 className="font-black text-xl uppercase">EXAM REVISION KEY POINTS</h2>
                    <span className="font-mono text-xs font-bold text-gray-700">
                      Essential formulas, concepts & definitions
                    </span>
                  </div>

                  {/* Filter Tags */}
                  <div className="flex flex-wrap items-center gap-1">
                    {['ALL', 'IMPORTANT', 'DEFINITION', 'FORMULA', 'CONCEPT'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setKeyPointFilter(cat)}
                        className={`px-2 py-0.5 text-[10px] font-black border transition-all ${
                          keyPointFilter === cat
                            ? 'bg-black text-white border-black font-mono'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {keyPoints
                    .filter(kp => keyPointFilter === 'ALL' || kp.category === keyPointFilter)
                    .map((kp, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#FFFDF5] comic-border-sm p-3 flex items-start gap-3 border-2 border-black"
                      >
                        <span className="bg-[#FFD83D] text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase shrink-0 mt-0.5">
                          {kp.category}
                        </span>
                        <p className="font-sans text-xs font-bold text-gray-900 leading-relaxed">
                          {kp.point}
                        </p>
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

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono font-bold">Loading Study Platform...</div>}>
      <StudyPlatformContent />
    </Suspense>
  );
}
