'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  FileText, 
  Mail, 
  Briefcase, 
  Code, 
  MessageSquare,
  Bot,
  User,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Cloud,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { processAIRequest } from '@/lib/ai';
import { sound } from '@/lib/sound';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  provider?: string;
  model?: string;
  fallbackOccurred?: boolean;
}

interface ProviderHealthInfo {
  name: 'ollama' | 'gemini' | 'groq';
  displayName: string;
  status: 'ONLINE' | 'OFFLINE' | 'CONFIGURED' | 'NOT_CONFIGURED' | 'MODEL_UNAVAILABLE';
  model?: string;
  availableModels?: string[];
  error?: string;
  isLocal: boolean;
}

export default function AiPage() {
  const [activeMode, setActiveMode] = useState<'chat' | 'summarize' | 'rewrite' | 'email' | 'interview' | 'coding'>('chat');
  const [providerOverride, setProviderOverride] = useState<'auto' | 'ollama' | 'gemini' | 'groq'>('auto');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "⚡ HEY HERO! Welcome to the Intelligence Laboratory. Powered by Local Ollama with Gemini & Groq cloud fallbacks!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'ollama',
    }
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Health Status Panel State
  const [showStatusPanel, setShowStatusPanel] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, ProviderHealthInfo>>({
    ollama: { name: 'ollama', displayName: 'Ollama (Local)', status: 'OFFLINE', model: 'llama3.2', isLocal: true },
    gemini: { name: 'gemini', displayName: 'Gemini (Cloud)', status: 'NOT_CONFIGURED', model: 'gemini-2.5-flash', isLocal: false },
    groq: { name: 'groq', displayName: 'Groq (Cloud)', status: 'NOT_CONFIGURED', model: 'llama-3.3-70b-versatile', isLocal: false },
  });
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; message: string; success: boolean } | null>(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const data = await res.json();
        if (data.providers) {
          setProviders(data.providers);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch provider health:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user?.name) {
          setUserName(data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  const handleTestProvider = async (provider: 'ollama' | 'gemini' | 'groq') => {
    setTestingProvider(provider);
    setTestResult(null);
    sound.playPop();

    try {
      const res = await fetch('/api/ai/test-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setTestResult({
        provider,
        message: data.message || (data.success ? 'Online & ready' : 'Failed to connect'),
        success: data.success,
      });
      if (data.success) {
        sound.playLevelUp();
      }
    } catch (err) {
      setTestResult({
        provider,
        message: err instanceof Error ? err.message : 'Network test error',
        success: false,
      });
    } finally {
      setTestingProvider(null);
      fetchHealth();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);
    sound.playPop();

    try {
      const response = await processAIRequest({
        tool: activeMode,
        prompt: currentPrompt,
        providerOverride,
      });

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: response.result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.provider,
        model: response.model,
        fallbackOccurred: response.fallbackOccurred,
      };

      setMessages(prev => [...prev, aiMsg]);
      sound.playLevelUp();
    } catch {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text: "🤖 AI SIGNAL OFFLINE. All providers (Ollama, Gemini, Groq) are currently unavailable.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const MODES = [
    { id: 'chat', label: 'AI CHAT', icon: MessageSquare },
    { id: 'summarize', label: 'SUMMARIZE', icon: FileText },
    { id: 'rewrite', label: 'REWRITE', icon: Sparkles },
    { id: 'email', label: 'EMAIL WRITER', icon: Mail },
    { id: 'interview', label: 'INTERVIEW COACH', icon: Briefcase },
    { id: 'coding', label: 'CODING HELPER', icon: Code },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="comic-sticker comic-sticker-purple">
              LABORATORY
            </span>
            <span className="text-xs font-mono font-bold bg-[#FFD83D] comic-border-sm px-2 py-0.5">
              LOCAL-FIRST MULTI-PROVIDER AI
            </span>
          </div>

          <button
            onClick={() => setShowStatusPanel(!showStatusPanel)}
            className="btn-comic btn-comic-white text-xs px-3 py-1 flex items-center gap-1.5 font-bold"
          >
            <Activity className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>PROVIDER STATUS</span>
            {showStatusPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h1 className="font-black text-4xl sm:text-6xl uppercase tracking-tight">
          {userName ? (
            userName.trim().split(' ')[0].toUpperCase().endsWith('S')
              ? `${userName.trim().split(' ')[0].toUpperCase()}' INTELLIGENCE`
              : `${userName.trim().split(' ')[0].toUpperCase()}'S INTELLIGENCE`
          ) : 'THE INTELLIGENCE'}
        </h1>

        {/* Speech Bubble Header */}
        <div className="speech-bubble text-sm font-extrabold bg-[#FFFDF5] inline-block">
          &quot;LOCAL FIRST. CLOUD WHEN NEEDED. Powered by Ollama → Gemini → Groq!&quot;
        </div>

        {/* Interactive Provider Status Panel */}
        {showStatusPanel && (
          <div className="bg-[#FFFDF5] comic-border p-5 rounded-2xl space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-black text-sm uppercase flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-[#A855F7]" />
                <span>AI PROVIDER HEALTH & CASCADE (OLLAMA → GEMINI → GROQ)</span>
              </span>
              <button
                onClick={fetchHealth}
                disabled={healthLoading}
                className="hover:underline font-bold flex items-center gap-1 text-gray-700"
              >
                <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
                <span>REFRESH</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Ollama Card */}
              <div className={`comic-border-sm p-3 space-y-2 rounded-xl ${
                providers.ollama?.status === 'ONLINE' ? 'bg-green-100' : 'bg-amber-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black font-sans text-sm flex items-center gap-1 text-black">
                    🦙 OLLAMA (LOCAL)
                  </span>
                  {providers.ollama?.status === 'ONLINE' ? (
                    <span className="bg-green-400 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ONLINE
                    </span>
                  ) : providers.ollama?.status === 'MODEL_UNAVAILABLE' ? (
                    <span className="bg-amber-300 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> MODEL MISSING
                    </span>
                  ) : (
                    <span className="bg-red-400 text-white text-[10px] font-black px-2 py-0.5 border border-black rounded flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> OFFLINE
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-gray-700 font-mono">
                  Model: <span className="font-bold text-black">{providers.ollama?.model || 'llama3.2'}</span>
                </div>

                {providers.ollama?.error && (
                  <p className="text-[10px] text-red-600 font-sans leading-tight">
                    {providers.ollama.error}
                  </p>
                )}

                <button
                  onClick={() => handleTestProvider('ollama')}
                  disabled={testingProvider === 'ollama'}
                  className="btn-comic btn-comic-white text-[10px] w-full py-1 font-black"
                >
                  {testingProvider === 'ollama' ? 'TESTING...' : '[ TEST OLLAMA ]'}
                </button>
              </div>

              {/* 2. Gemini Card */}
              <div className={`comic-border-sm p-3 space-y-2 rounded-xl ${
                providers.gemini?.status === 'CONFIGURED' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black font-sans text-sm flex items-center gap-1 text-black">
                    ✨ GEMINI (CLOUD)
                  </span>
                  {providers.gemini?.status === 'CONFIGURED' ? (
                    <span className="bg-purple-300 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CONFIGURED
                    </span>
                  ) : (
                    <span className="bg-gray-300 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-gray-700 font-mono">
                  Model: <span className="font-bold text-black">{providers.gemini?.model || 'gemini-2.5-flash'}</span>
                </div>

                <button
                  onClick={() => handleTestProvider('gemini')}
                  disabled={testingProvider === 'gemini'}
                  className="btn-comic btn-comic-white text-[10px] w-full py-1 font-black"
                >
                  {testingProvider === 'gemini' ? 'TESTING...' : '[ TEST GEMINI ]'}
                </button>
              </div>

              {/* 3. Groq Card */}
              <div className={`comic-border-sm p-3 space-y-2 rounded-xl ${
                providers.groq?.status === 'CONFIGURED' ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black font-sans text-sm flex items-center gap-1 text-black">
                    ⚡ GROQ (CLOUD)
                  </span>
                  {providers.groq?.status === 'CONFIGURED' ? (
                    <span className="bg-amber-300 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CONFIGURED
                    </span>
                  ) : (
                    <span className="bg-gray-300 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded">
                      NOT CONFIGURED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-gray-700 font-mono">
                  Model: <span className="font-bold text-black">{providers.groq?.model || 'llama-3.3-70b'}</span>
                </div>

                <button
                  onClick={() => handleTestProvider('groq')}
                  disabled={testingProvider === 'groq'}
                  className="btn-comic btn-comic-white text-[10px] w-full py-1 font-black"
                >
                  {testingProvider === 'groq' ? 'TESTING...' : '[ TEST GROQ ]'}
                </button>
              </div>

            </div>

            {testResult && (
              <div className={`p-3 comic-border-sm rounded-xl font-mono text-xs ${
                testResult.success ? 'bg-green-200 text-black' : 'bg-red-100 text-red-900'
              }`}>
                <span className="font-black uppercase">[{testResult.provider} TEST]: </span>
                <span>{testResult.message}</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Assistant Mode Pills & Provider Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMode(m.id as typeof activeMode);
                  sound.playPop();
                }}
                className={`btn-comic text-xs px-3.5 py-2 flex items-center gap-1.5 ${
                  activeMode === m.id ? 'btn-comic-purple font-black' : 'btn-comic-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Provider Override Selector */}
        <div className="flex items-center gap-2 bg-white comic-border p-2 rounded-xl font-mono text-xs">
          <span className="font-black text-black">PROVIDER:</span>
          <select
            value={providerOverride}
            onChange={(e) => setProviderOverride(e.target.value as typeof providerOverride)}
            className="comic-input py-1 px-2 text-xs font-bold font-sans cursor-pointer bg-[#FFFDF5]"
          >
            <option value="auto">AUTO (Ollama → Gemini → Groq)</option>
            <option value="ollama">🦙 OLLAMA (Force Local)</option>
            <option value="gemini">✨ GEMINI (Force Cloud)</option>
            <option value="groq">⚡ GROQ (Force Cloud)</option>
          </select>
        </div>
      </div>

      {/* Main Chat / AI Workspace Window */}
      <div className="bg-white comic-border-lg shadow-comic-lg p-4 sm:p-6 flex flex-col h-[550px]">
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 comic-border-sm flex items-center justify-center text-xs font-black flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-[#FFD83D]' : 'bg-[#B9A7FF]'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Speech Bubble Message Body */}
              <div className="max-w-xl comic-border-sm p-4 text-xs sm:text-sm font-bold shadow-comic-sm leading-relaxed space-y-1 bg-[#FFFDF5] text-black">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mb-1 pb-1 border-b border-gray-300">
                  <span>{msg.sender === 'user' ? 'HERO' : 'DEION AI'}</span>
                  
                  {msg.sender === 'ai' && (
                    <span className="flex items-center gap-1 font-bold">
                      {msg.provider === 'ollama' && (
                        <span className="bg-green-200 text-black px-1.5 py-0.5 border border-black rounded text-[9px] font-black">
                          🦙 LOCAL SIGNAL ({msg.model || 'llama3.2'})
                        </span>
                      )}
                      {msg.provider === 'gemini' && (
                        <span className="bg-purple-200 text-black px-1.5 py-0.5 border border-black rounded text-[9px] font-black">
                          ✨ CLOUD SIGNAL ({msg.model || 'gemini'})
                        </span>
                      )}
                      {msg.provider === 'groq' && (
                        <span className="bg-amber-200 text-black px-1.5 py-0.5 border border-black rounded text-[9px] font-black">
                          ⚡ BACKUP SIGNAL ({msg.model || 'groq'})
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#B9A7FF] comic-border-sm flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#FFFDF5] comic-border-sm p-3 text-xs font-black text-gray-700 animate-pulse">
                THINKING (OLLAMA → GEMINI → GROQ)...
              </div>
            </div>
          )}
        </div>

        {/* Input Form Bar */}
        <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t-3 border-black flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask AI in ${activeMode.toUpperCase()} mode...`}
            className="comic-input text-xs sm:text-sm flex-1 font-bold"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-comic btn-comic-purple px-6 text-xs flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">SEND</span>
          </button>
        </form>

      </div>

    </div>
  );
}
