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
  X,
  HardDrive,
  AlertTriangle,
  FolderOpen
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

interface StorageInfo {
  usedBytes: number;
  maxBytes: number;
  availableBytes: number;
  usedPercentage: number;
  maxMb: number;
}

interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  processingStatus?: string;
  processingProgress?: number;
  blobPathname?: string;
  createdAt: string;
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
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // Document Library & Search
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  // Delete PDF Modal State
  const [docToDelete, setDocToDelete] = useState<StudyDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');

  // UI & Real Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
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
      if (data.documents) {
        setDocuments(data.documents);
        if (data.storage) {
          setStorageInfo(data.storage);
        }
        if (data.documents.length > 0) {
          const docToSelect = initialDocId 
            ? data.documents.find((d: any) => d.id === initialDocId) || data.documents[0]
            : data.documents[0];
          fetchDocumentDetails(docToSelect.id);
        } else {
          setActiveDoc(null);
        }
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

  // Upload PDF Handler with Real Progress & Storage Quota Verification
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadPercent(0);
    setUploadStatus('Preparing PDF upload...');
    sound.playPop();

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Real progress tracking using XMLHttpRequest
      const xhr = new XMLHttpRequest();
      
      const uploadPromise = new Promise<{ ok: boolean; status: number; data: any }>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadPercent(percent);
            setUploadStatus(`Uploading ${file.name}... ${percent}%`);
            if (percent === 100) {
              setUploadStatus('Extracting PDF text & detecting chapters...');
            }
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data: json });
          } catch {
            reject(new Error('Invalid server response'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error uploading PDF'));
        xhr.open('POST', '/api/study/upload');
        xhr.send(formData);
      });

      const { ok, status, data } = await uploadPromise;

      if (!ok || data.error) {
        if (data.code === 'SESSION_USER_NOT_FOUND' || status === 401) {
          const confirmed = window.confirm(
            '⚠️ Your session has expired.\n\nYou need to log out and log back in to upload PDFs.\n\nClick OK to log out now.'
          );
          if (confirmed) {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }
          return;
        }

        if (data.code === 'STORAGE_QUOTA_EXCEEDED') {
          alert('⚠️ Not enough study storage available. Delete an existing PDF to free up space.');
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
    } catch (err: any) {
      alert(err?.message || 'Error uploading PDF file');
    } finally {
      setIsUploading(false);
      setUploadPercent(0);
      setUploadStatus('');
    }
  };

  // Delete PDF Handler
  const handleDeletePDF = async (docId: string) => {
    if (!docId) return;
    setIsDeleting(true);
    setDeleteStatus('Removing PDF from Private Vercel Blob storage...');
    sound.playPop();

    try {
      const res = await fetch(`/api/study/documents/${docId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        alert(data.error || 'Failed to delete PDF document');
        setIsDeleting(false);
        return;
      }

      setDeleteStatus('Cleaning up chapters, flashcards, quizzes & storage quota...');
      await fetchDocuments();

      if (activeDoc?.id === docId) {
        const remaining = documents.filter(d => d.id !== docId);
        if (remaining.length > 0) {
          setActiveDoc(remaining[0]);
          fetchDocumentDetails(remaining[0].id);
        } else {
          setActiveDoc(null);
        }
      }

      sound.playLevelUp();
      setDocToDelete(null);
    } catch (err) {
      alert('Failed to delete document.');
    } finally {
      setIsDeleting(false);
      setDeleteStatus('');
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
    if (activeDoc) {
      loadModeContent(activeDoc.id, chapterId, activeMode);
    }
  };

  // Select Mode
  const handleChangeMode = (mode: ModeType) => {
    setActiveMode(mode);
    if (activeDoc) {
      loadModeContent(activeDoc.id, selectedChapterId, mode);
    }
  };

  // Toggle Flashcard Mastery
  const handleToggleCardMastery = async (cardId: string, currentMastered: boolean) => {
    sound.playPop();
    const newStatus = !currentMastered;
    setFlashcards(prev => prev.map(c => c.id === cardId ? { ...c, mastered: newStatus } : c));

    try {
      await fetch('/api/study/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'master_card',
          cardId,
          mastered: newStatus,
        })
      });
    } catch (err) {
      console.error('Error toggling card mastery:', err);
    }
  };

  // Submit Quiz Question Answer
  const handleAnswerQuizQuestion = async (optionIdx: number) => {
    if (quizSubmitted || !quizQuestions[currentQuizIdx]) return;
    setSelectedQuizOption(optionIdx);
    setQuizSubmitted(true);

    const currentQ = quizQuestions[currentQuizIdx];
    const isRight = optionIdx === currentQ.correctAnswer;

    if (isRight) {
      sound.playLevelUp();
      setQuizScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      sound.playPop();
    }

    setQuizQuestions(prev => prev.map((q, idx) => 
      idx === currentQuizIdx ? { ...q, userAnswer: optionIdx, isCorrect: isRight } : q
    ));

    try {
      await fetch('/api/study/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_quiz_answer',
          questionId: currentQ.id,
          userAnswer: optionIdx,
          isCorrect: isRight,
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

  const formatMb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

  const selectedChapterName = selectedChapterId === 'ALL' 
    ? 'ALL CHAPTERS (FULL PDF)'
    : activeDoc?.chapters.find(c => c.id === selectedChapterId)?.title || 'Chapter';

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
    d.fileName.toLowerCase().includes(librarySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6 max-w-7xl mx-auto select-none">

      {/* Top Header & Document Controls */}
      <div className="bg-[#FFD83D] comic-border-lg shadow-comic-lg p-6 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="comic-badge comic-badge-red text-xs">AI PDF LEARNING PLATFORM</span>
            <span className="font-mono text-xs font-bold bg-black text-white px-2 py-0.5 rounded">PRIVATE VERCEL BLOB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-1">
            {activeDoc ? activeDoc.title : 'STUDY HUB'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-800 font-mono mt-1">
            {activeDoc 
              ? `📄 ${activeDoc.fileName} • ${activeDoc.chapters.length} Chapters Detected • ${activeDoc.pageCount} Pages • ${(activeDoc.fileSize / (1024 * 1024)).toFixed(1)} MB`
              : 'Upload any PDF textbook, paper, or notes to generate structured summaries, explanations, flashcards, quizzes & key points.'}
          </p>
        </div>

        {/* Upload Dropzone / Storage Indicator / Library Toggle */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto flex-wrap">
          
          <button
            onClick={() => setLibraryOpen(true)}
            className="bg-white hover:bg-yellow-100 comic-border-sm px-3 py-2 text-xs font-black uppercase rounded shadow-comic-sm flex items-center gap-1.5"
            title="Open Document Library & Manage Storage"
          >
            <FolderOpen className="w-4 h-4 text-black" />
            <span>LIBRARY ({documents.length})</span>
          </button>

          {/* Storage Quota Pill */}
          {storageInfo && (
            <div className="bg-black text-[#FFD83D] comic-border-sm px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#FF5A5F]" />
              <span>{formatMb(storageInfo.usedBytes)}MB / {storageInfo.maxMb}MB</span>
            </div>
          )}

          {/* Upload Button */}
          <label className="bg-black hover:bg-[#FF5A5F] text-[#FFD83D] hover:text-white comic-border-sm px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-comic-sm transition-all shrink-0">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? `${uploadPercent}%` : 'UPLOAD PDF'}</span>
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

      {/* REAL UPLOADING & PROCESSING PROGRESS BAR */}
      {isUploading && (
        <div className="bg-white comic-border-lg p-4 space-y-2 shadow-comic-md">
          <div className="flex items-center justify-between text-xs font-mono font-black">
            <span className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-[#FF5A5F]" />
              <span>{uploadStatus}</span>
            </span>
            <span>{uploadPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 h-3 comic-border-sm overflow-hidden">
            <div 
              className="bg-[#FF5A5F] h-full transition-all duration-200" 
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* EMPTY STUDY LIBRARY STATE */}
      {documents.length === 0 && !isUploading ? (
        <div className="bg-white comic-border-lg shadow-comic-lg p-12 text-center space-y-5">
          <div className="w-20 h-20 bg-[#FFD83D] comic-border-md rounded-full mx-auto flex items-center justify-center font-black text-3xl">
            📚
          </div>
          <h2 className="font-black text-3xl uppercase">YOUR STUDY LIBRARY IS EMPTY</h2>
          <p className="font-mono text-sm text-gray-700 max-w-md mx-auto font-bold">
            Upload a textbook, notes, research paper, or study material to begin.
          </p>
          <label className="btn-comic btn-comic-yellow text-sm px-6 py-3 inline-flex items-center gap-2 font-black uppercase cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>UPLOAD YOUR FIRST PDF</span>
            <input 
              type="file" 
              accept=".pdf,application/pdf" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
      ) : (
        /* MAIN STUDY WORKSPACE (2 Columns) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT CHAPTER NAVIGATION PANEL */}
          <div className="lg:col-span-4 space-y-4">

            {/* Mobile Drawer Toggle */}
            <div className="lg:hidden flex items-center justify-between bg-white comic-border-md p-3">
              <span className="font-black text-xs uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-black" />
                <span>SELECTED: {selectedChapterName}</span>
              </span>
              <button 
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="bg-black text-white p-1 rounded font-black text-xs uppercase"
              >
                {mobileDrawerOpen ? 'CLOSE' : 'CHAPTERS'}
              </button>
            </div>

            {/* CHAPTER LIST CARD */}
            <div className={`bg-white comic-border-lg shadow-comic-lg p-4 space-y-3 ${mobileDrawerOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                <span className="font-black text-xs uppercase flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
                  <span>CHAPTERS ({activeDoc?.chapters.length || 0})</span>
                </span>
                <span className="comic-sticker comic-sticker-yellow text-[10px]">
                  SELECT SCOPE
                </span>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {/* ALL CHAPTERS OPTION */}
                <button
                  onClick={() => handleSelectChapter('ALL')}
                  className={`w-full text-left p-2.5 comic-border-sm font-bold text-xs flex items-center justify-between transition-all ${
                    selectedChapterId === 'ALL'
                      ? 'bg-[#FFD83D] text-black font-black shadow-comic-sm'
                      : 'bg-white hover:bg-yellow-50 text-gray-900'
                  }`}
                >
                  <span className="truncate">📖 ALL CHAPTERS (FULL PDF)</span>
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded font-mono">
                    {activeDoc?.pageCount || 1} PG
                  </span>
                </button>

                {/* CHAPTER ITEMS */}
                {activeDoc?.chapters.map((ch) => {
                  const isSelected = selectedChapterId === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch.id)}
                      className={`w-full text-left p-2.5 comic-border-sm font-bold text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#FF5A5F] text-white font-black shadow-comic-sm'
                          : 'bg-white hover:bg-red-50 text-gray-900'
                      }`}
                    >
                      <span className="truncate font-mono">
                        {ch.chapterNumber}. {ch.title}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI TUTOR QUICK QUESTION BOX */}
            <div className="bg-[#B9A7FF] comic-border-lg shadow-comic-lg p-4 space-y-3">
              <h4 className="font-black text-xs uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-black" />
                <span>AI TUTOR</span>
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
                  className="w-full bg-black text-white hover:bg-gray-800 comic-border-sm p-1.5 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
                    className={`py-2.5 px-1 sm:px-3 border-2 font-black text-[10px] sm:text-xs uppercase tracking-tight transition-all text-center rounded-t-lg cursor-pointer ${
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
                    Synthesizing content through Ollama → Gemini → Groq fallback pipeline...
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
                        className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm cursor-pointer"
                        title="Generate new fresh summary with AI"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>REGENERATE NEW</span>
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(summaryText)}
                        className="bg-gray-100 hover:bg-gray-200 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 cursor-pointer"
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
                      className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm shrink-0 ml-2 cursor-pointer"
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
                      className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm shrink-0 ml-2 cursor-pointer"
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
                          className="bg-white hover:bg-gray-100 disabled:opacity-40 comic-border-sm px-3 py-2 text-xs font-black uppercase cursor-pointer"
                        >
                          PREV
                        </button>

                        <button
                          onClick={() => handleToggleCardMastery(
                            flashcards[currentCardIdx].id, 
                            flashcards[currentCardIdx].mastered
                          )}
                          className={`comic-border-sm px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
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
                          className="bg-white hover:bg-gray-100 disabled:opacity-40 comic-border-sm px-3 py-2 text-xs font-black uppercase cursor-pointer"
                        >
                          NEXT
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 font-mono text-sm font-bold text-gray-700">
                      No flashcards generated for this scope yet.
                    </div>
                  )}
                </div>
              )}

              {/* MODE 4: QUIZ */}
              {activeMode === 'QUIZ' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                    <div>
                      <h2 className="font-black text-xl uppercase">INTERACTIVE KNOWLEDGE QUIZ</h2>
                      <span className="font-mono text-xs font-bold text-gray-700">
                        Question {currentQuizIdx + 1} of {quizQuestions.length} • Score: {quizScore.correct}/{quizScore.total}
                      </span>
                    </div>
                    <button
                      onClick={() => activeDoc && loadModeContent(activeDoc.id, selectedChapterId, 'QUIZ', true)}
                      className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm shrink-0 ml-2 cursor-pointer"
                      title="Generate new fresh quiz questions with AI"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>REGENERATE NEW</span>
                    </button>
                  </div>

                  {quizQuestions.length > 0 ? (
                    <div className="max-w-xl mx-auto space-y-5">
                      {quizComplete ? (
                        <div className="bg-[#FFD83D] comic-border-lg p-6 text-center space-y-4">
                          <Trophy className="w-12 h-12 text-black mx-auto" />
                          <h3 className="font-black text-2xl uppercase">QUIZ COMPLETED!</h3>
                          <p className="font-mono text-sm font-bold">
                            YOUR SCORE: {quizScore.correct} / {quizScore.total} ({Math.round((quizScore.correct / (quizScore.total || 1)) * 100)}%)
                          </p>
                          <button
                            onClick={() => {
                              setCurrentQuizIdx(0);
                              setQuizComplete(false);
                            }}
                            className="bg-black text-white hover:bg-gray-800 comic-border-sm px-6 py-2.5 font-black text-xs uppercase cursor-pointer"
                          >
                            RESTART QUIZ
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-[#FFFDF5] comic-border-md p-4 space-y-2">
                            <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                              TOPIC: {quizQuestions[currentQuizIdx].topic}
                            </span>
                            <h3 className="font-black text-lg text-gray-900 leading-snug">
                              {quizQuestions[currentQuizIdx].question}
                            </h3>
                          </div>

                          <div className="space-y-2">
                            {quizQuestions[currentQuizIdx].options.map((opt, optIdx) => {
                              const isSelected = selectedQuizOption === optIdx;
                              const isCorrectAnswer = optIdx === quizQuestions[currentQuizIdx].correctAnswer;
                              let btnStyle = 'bg-white hover:bg-yellow-50 text-black border-gray-400';

                              if (quizSubmitted) {
                                if (isCorrectAnswer) {
                                  btnStyle = 'bg-green-500 text-white font-black border-black';
                                } else if (isSelected && !isCorrectAnswer) {
                                  btnStyle = 'bg-red-500 text-white font-black border-black';
                                }
                              } else if (isSelected) {
                                btnStyle = 'bg-[#FFD83D] text-black font-black border-black';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleAnswerQuizQuestion(optIdx)}
                                  disabled={quizSubmitted}
                                  className={`w-full text-left p-3 comic-border-sm text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                                >
                                  <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                  {quizSubmitted && isCorrectAnswer && <Check className="w-4 h-4 text-white shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="bg-[#B9A7FF] comic-border-sm p-4 space-y-3">
                              <div className="font-black text-xs uppercase">
                                {selectedQuizOption === quizQuestions[currentQuizIdx].correctAnswer ? '✓ CORRECT!' : '❌ INCORRECT'}
                              </div>
                              <p className="font-mono text-xs text-gray-900">
                                {quizQuestions[currentQuizIdx].explanation}
                              </p>
                              <button
                                onClick={handleNextQuizQuestion}
                                className="w-full bg-black text-white hover:bg-gray-800 comic-border-sm p-2 text-xs font-black uppercase cursor-pointer"
                              >
                                NEXT QUESTION →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 font-mono text-sm font-bold text-gray-700">
                      No quiz questions generated for this scope yet.
                    </div>
                  )}
                </div>
              )}

              {/* MODE 5: KEY POINTS */}
              {activeMode === 'KEY_POINTS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                    <div>
                      <h2 className="font-black text-xl uppercase">REVISION KEY POINTS</h2>
                      <span className="font-mono text-xs font-bold text-gray-700">
                        Essential formulas, definitions & exam highlights
                      </span>
                    </div>
                    <button
                      onClick={() => activeDoc && loadModeContent(activeDoc.id, selectedChapterId, 'KEY_POINTS', true)}
                      className="bg-[#FFD83D] hover:bg-yellow-400 comic-border-sm p-1.5 text-xs font-black flex items-center gap-1 shadow-comic-sm shrink-0 ml-2 cursor-pointer"
                      title="Generate new fresh key points with AI"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>REGENERATE NEW</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {keyPoints.map((kp, idx) => (
                      <div key={idx} className="bg-[#FFFDF5] comic-border-sm p-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                            {kp.category}
                          </span>
                          {kp.importance === 'high' && (
                            <span className="bg-[#FF5A5F] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                              ★ HIGH IMPORTANCE
                            </span>
                          )}
                        </div>
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
      )}

      {/* DOCUMENT LIBRARY MODAL */}
      {libraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF5] comic-border-lg shadow-comic-lg p-6 max-w-2xl w-full space-y-4 max-h-[85vh] flex flex-col relative border-4 border-black">
            <div className="flex items-center justify-between border-b-3 border-black pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-black" />
                <h3 className="font-black text-xl uppercase">MY STUDY LIBRARY</h3>
              </div>
              <button 
                onClick={() => setLibraryOpen(false)}
                className="bg-black text-white p-1 rounded font-black text-xs hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Storage Quota Bar */}
            {storageInfo && (
              <div className="bg-[#FFD83D] comic-border-sm p-3 font-mono text-xs space-y-1">
                <div className="flex items-center justify-between font-black">
                  <span>STUDY STORAGE USAGE</span>
                  <span>{formatMb(storageInfo.usedBytes)} MB / {storageInfo.maxMb} MB ({storageInfo.usedPercentage}%)</span>
                </div>
                <div className="w-full bg-white h-3 comic-border-sm overflow-hidden">
                  <div 
                    className="bg-black h-full transition-all duration-300"
                    style={{ width: `${storageInfo.usedPercentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-800 font-bold">
                  {formatMb(storageInfo.availableBytes)} MB available for new PDF study materials.
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search PDF files by name..."
                className="w-full bg-white comic-border-sm pl-9 pr-3 py-2 text-xs font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-8 font-mono text-xs text-gray-600 font-bold">
                  No matching PDFs found in your library.
                </div>
              ) : (
                filteredDocs.map((d) => (
                  <div key={d.id} className="bg-white comic-border-sm p-3 flex items-center justify-between gap-3 hover:bg-yellow-50">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase truncate text-black">{d.title}</span>
                        <span className="bg-green-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded border border-black">
                          {d.processingStatus || 'READY'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-gray-600 font-bold">
                        📄 {d.fileName} • {d.pageCount} pgs • {d.chapters.length} chapters • {formatMb(d.fileSize)} MB
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setActiveDoc(d);
                          setSelectedChapterId('ALL');
                          fetchDocumentDetails(d.id);
                          setLibraryOpen(false);
                        }}
                        className="bg-black text-[#FFD83D] hover:bg-gray-800 comic-border-sm px-3 py-1.5 text-xs font-black uppercase cursor-pointer"
                      >
                        STUDY
                      </button>
                      <button
                        onClick={() => setDocToDelete(d)}
                        className="bg-red-500 hover:bg-red-600 text-white comic-border-sm p-1.5 text-xs font-black uppercase cursor-pointer"
                        title="Delete PDF & Storage Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF5] comic-border-lg shadow-comic-lg p-6 max-w-md w-full space-y-4 border-4 border-black relative">
            
            <div className="bg-[#FF5A5F] text-white comic-border-sm p-3 font-black text-sm uppercase flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>DELETE PERMANENTLY?</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-gray-900 font-bold">
              <p>
                Are you sure you want to delete <span className="underline font-black">{docToDelete.fileName}</span>?
              </p>
              <p className="text-red-600">
                This will permanently remove the original PDF from Private Vercel Blob storage and delete all associated chapters, flashcards, quizzes, and progress. This action cannot be undone.
              </p>
            </div>

            {isDeleting && (
              <div className="bg-yellow-100 comic-border-sm p-3 font-mono text-xs text-black font-black flex items-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-[#FF5A5F]" />
                <span>{deleteStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDocToDelete(null)}
                className="bg-white hover:bg-gray-100 disabled:opacity-50 comic-border-sm px-4 py-2 text-xs font-black uppercase cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeletePDF(docToDelete.id)}
                className="bg-[#FF5A5F] hover:bg-red-600 disabled:opacity-50 text-white comic-border-sm px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer shadow-comic-sm"
              >
                {isDeleting ? 'DELETING...' : 'DELETE PERMANENTLY'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF5]" />}>
      <StudyPlatformContent />
    </Suspense>
  );
}
