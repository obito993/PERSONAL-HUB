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
  User as UserIcon,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  ChevronDown,
  ChevronUp,
  Brain,
  ListTodo,
  Zap,
  Shield,
  Settings,
  Plus,
  Trash2,
  Search,
  Check
} from 'lucide-react';
import { sound } from '@/lib/sound';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  provider?: string;
  model?: string;
  recalledMemories?: any[];
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

interface MemoryItem {
  id: string;
  category: string;
  content: string;
  source: string;
  importance: number;
  createdAt: string;
}

interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  resultSummary?: string;
  createdAt: string;
  steps: { id: string; stepIndex: number; title: string; status: string; resultText?: string }[];
}

interface AgentAutomation {
  id: string;
  title: string;
  prompt: string;
  schedule: string;
  enabled: boolean;
}

interface AuditLogItem {
  id: string;
  toolName: string;
  actionSummary: string;
  approvalStatus: string;
  timestamp: string;
}

export default function AiPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'tasks' | 'automations' | 'audit' | 'settings'>('chat');
  const [activeMode, setActiveMode] = useState<'chat' | 'summarize' | 'rewrite' | 'email' | 'interview' | 'coding'>('chat');
  const [providerOverride, setProviderOverride] = useState<'auto' | 'ollama' | 'gemini' | 'groq'>('auto');
  
  const [userName, setUserName] = useState<string>('');
  const [agentSettings, setAgentSettings] = useState<any>({
    customName: 'Personal AI',
    personality: 'helpful, precise, encouraging',
    responseStyle: 'detailed',
    memoryEnabled: true,
    approvalLevel: 'SUPERVISED',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Memories State
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [newMemContent, setNewMemContent] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<'preference' | 'project' | 'fact' | 'workflow'>('fact');
  const [memSearch, setMemSearch] = useState('');

  // Tasks State
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  // Automations State
  const [automations, setAutomations] = useState<AgentAutomation[]>([]);
  const [autoTitle, setAutoTitle] = useState('');
  const [autoPrompt, setAutoPrompt] = useState('');
  const [autoSchedule, setAutoSchedule] = useState('daily');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Settings edit state
  const [editCustomName, setEditCustomName] = useState('');
  const [editPersonality, setEditPersonality] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const firstName = userName ? userName.trim().split(' ')[0] : 'Hero';
  const displayAgentTitle = agentSettings.customName && agentSettings.customName !== 'Personal AI'
    ? `${firstName.toUpperCase()}'S AI AGENT (${agentSettings.customName.toUpperCase()})`
    : (firstName.toUpperCase().endsWith('S')
        ? `${firstName.toUpperCase()}' AI AGENT`
        : `${firstName.toUpperCase()}'S AI AGENT`);

  useEffect(() => {
    fetchHealth();

    // Fetch user details & agent settings
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user?.name) {
          setUserName(data.user.name);
          const fName = data.user.name.trim().split(' ')[0];
          setMessages([
            {
              id: 'm1',
              sender: 'ai',
              text: `⚡ Welcome, ${data.user.name}! I am your isolated Personal AI Agent. I hold your private memories, automations, tasks, and study tools. Powered by Local Ollama with Gemini & Groq cloud fallbacks!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              provider: 'ollama',
            }
          ]);
        }
      })
      .catch(() => {});

    fetchSettings();
    fetchMemories();
    fetchTasks();
    fetchAutomations();
    fetchAuditLogs();
  }, []);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const data = await res.json();
        if (data.providers) setProviders(data.providers);
      }
    } catch (err) {
      console.warn('Failed to fetch provider health:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/agent/settings');
      const data = await res.json();
      if (data.settings) {
        setAgentSettings(data.settings);
        setEditCustomName(data.settings.customName || '');
        setEditPersonality(data.settings.personality || '');
      }
    } catch (err) {
      console.warn('Failed to fetch settings:', err);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/agent/memory');
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    } catch (err) {
      console.warn('Failed to fetch memories:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/agent/tasks');
      const data = await res.json();
      if (data.tasks) setAgentTasks(data.tasks);
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
    }
  };

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/agent/automations');
      const data = await res.json();
      if (data.automations) setAutomations(data.automations);
    } catch (err) {
      console.warn('Failed to fetch automations:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/agent/audit-logs');
      const data = await res.json();
      if (data.auditLogs) setAuditLogs(data.auditLogs);
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    }
  };

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
      if (data.success) sound.playLevelUp();
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

  const handleSubmitChat = async (e: React.FormEvent) => {
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
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          providerOverride,
        })
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || 'Chat request failed');

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider,
        model: data.model,
        recalledMemories: data.recalledMemories,
      };

      setMessages(prev => [...prev, aiMsg]);
      sound.playLevelUp();
      fetchMemories();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text: `🤖 SIGNAL ERROR: ${err.message || 'All AI providers unavailable.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemContent.trim()) return;

    try {
      const res = await fetch('/api/agent/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newMemCategory,
          content: newMemContent,
          importance: 2,
        })
      });
      if (res.ok) {
        setNewMemContent('');
        sound.playLevelUp();
        fetchMemories();
      }
    } catch (err) {
      alert('Failed to add memory.');
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/agent/memory?id=${id}`, { method: 'DELETE' });
      sound.playPop();
      fetchMemories();
    } catch (err) {
      alert('Failed to delete memory.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || creatingTask) return;

    setCreatingTask(true);
    sound.playPop();

    try {
      const res = await fetch('/api/agent/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
        })
      });
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        sound.playLevelUp();
        fetchTasks();
        fetchAuditLogs();
      }
    } catch (err) {
      alert('Failed to launch task.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoTitle.trim() || !autoPrompt.trim()) return;

    try {
      const res = await fetch('/api/agent/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: autoTitle,
          prompt: autoPrompt,
          schedule: autoSchedule,
        })
      });
      if (res.ok) {
        setAutoTitle('');
        setAutoPrompt('');
        sound.playLevelUp();
        fetchAutomations();
      }
    } catch (err) {
      alert('Failed to create automation.');
    }
  };

  const handleToggleAutomation = async (id: string, currentEnabled: boolean) => {
    try {
      await fetch('/api/agent/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentEnabled })
      });
      sound.playPop();
      fetchAutomations();
    } catch (err) {
      alert('Failed to update automation.');
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    try {
      await fetch(`/api/agent/automations?id=${id}`, { method: 'DELETE' });
      sound.playPop();
      fetchAutomations();
    } catch (err) {
      alert('Failed to delete automation.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await fetch('/api/agent/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customName: editCustomName,
          personality: editPersonality,
          memoryEnabled: agentSettings.memoryEnabled,
          approvalLevel: agentSettings.approvalLevel,
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAgentSettings(data.settings);
        sound.playLevelUp();
        alert('Agent settings updated successfully!');
      }
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(memSearch.toLowerCase()) || 
    m.category.toLowerCase().includes(memSearch.toLowerCase())
  );

  const MODES = [
    { id: 'chat', label: 'AI CHAT', icon: MessageSquare },
    { id: 'summarize', label: 'SUMMARIZE', icon: FileText },
    { id: 'rewrite', label: 'REWRITE', icon: Sparkles },
    { id: 'email', label: 'EMAIL WRITER', icon: Mail },
    { id: 'interview', label: 'INTERVIEW COACH', icon: Briefcase },
    { id: 'coding', label: 'CODING HELPER', icon: Code },
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* Dynamic Header */}
      <div className="bg-white comic-border-lg p-6 sm:p-8 shadow-comic space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="comic-sticker comic-sticker-purple">
              PERSONAL AGENT HQ
            </span>
            <span className="text-xs font-mono font-bold bg-[#FFD83D] comic-border-sm px-2 py-0.5">
              100% USER ISOLATED • OLLAMA → GEMINI → GROQ
            </span>
          </div>

          <button
            onClick={() => setShowStatusPanel(!showStatusPanel)}
            className="btn-comic btn-comic-white text-xs px-3 py-1 flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>PROVIDER CASCADE STATUS</span>
            {showStatusPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <h1 className="font-black text-3xl sm:text-5xl uppercase tracking-tight">
          {displayAgentTitle}
        </h1>

        {/* Speech Bubble Header */}
        <div className="speech-bubble text-sm font-extrabold bg-[#FFFDF5] inline-block">
          &quot;Welcome back, {firstName}! I am your dedicated Personal AI Agent with private memory, tools & automated tasks.&quot;
        </div>

        {/* Interactive Provider Status Panel */}
        {showStatusPanel && (
          <div className="bg-[#FFFDF5] comic-border p-5 rounded-2xl space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-black text-sm uppercase flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-[#A855F7]" />
                <span>CASCADE HEALTH (OLLAMA → GEMINI → GROQ)</span>
              </span>
              <button
                onClick={fetchHealth}
                disabled={healthLoading}
                className="hover:underline font-bold flex items-center gap-1 text-gray-700 cursor-pointer"
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
                  ) : (
                    <span className="bg-amber-300 text-black text-[10px] font-black px-2 py-0.5 border border-black rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> STANDBY
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-700 font-mono">
                  Model: <span className="font-bold text-black">{providers.ollama?.model || 'llama3.2'}</span>
                </div>
                <button
                  onClick={() => handleTestProvider('ollama')}
                  disabled={testingProvider === 'ollama'}
                  className="btn-comic btn-comic-white text-[10px] w-full py-1 font-black cursor-pointer"
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
                  className="btn-comic btn-comic-white text-[10px] w-full py-1 font-black cursor-pointer"
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
                  className="btn-comic btn-comic-white text-[10px] w-full py-1 font-black cursor-pointer"
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

      {/* Main Command Center Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b-3 border-black pb-2">
        <button
          onClick={() => { setActiveTab('chat'); sound.playPop(); }}
          className={`btn-comic text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'chat' ? 'btn-comic-purple font-black' : 'btn-comic-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>CHAT & ASSISTANT</span>
        </button>

        <button
          onClick={() => { setActiveTab('memory'); sound.playPop(); }}
          className={`btn-comic text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'memory' ? 'btn-comic-yellow font-black' : 'btn-comic-white'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>MEMORIES ({memories.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('tasks'); sound.playPop(); }}
          className={`btn-comic text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tasks' ? 'btn-comic-red font-black' : 'btn-comic-white'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>AUTONOMOUS TASKS ({agentTasks.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('automations'); sound.playPop(); }}
          className={`btn-comic text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'automations' ? 'btn-comic-purple font-black' : 'btn-comic-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>AUTOMATIONS ({automations.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('audit'); sound.playPop(); }}
          className={`btn-comic text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit' ? 'btn-comic-white font-black border-black' : 'btn-comic-white'
          }`}
        >
          <Shield className="w-4 h-4 text-purple-700" />
          <span>AUDIT LOG</span>
        </button>

        <button
          onClick={() => { setActiveTab('settings'); sound.playPop(); }}
          className={`btn-comic text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'settings' ? 'btn-comic-yellow font-black' : 'btn-comic-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>AGENT SETTINGS</span>
        </button>
      </div>

      {/* TAB 1: CHAT & ASSISTANT */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMode(m.id as typeof activeMode); sound.playPop(); }}
                    className={`btn-comic text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer ${
                      activeMode === m.id ? 'btn-comic-purple font-black' : 'btn-comic-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

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

          <div className="bg-white comic-border-lg shadow-comic-lg p-4 sm:p-6 flex flex-col h-[550px]">
            <div className="flex-1 overflow-y-auto space-y-4 p-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 comic-border-sm flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    msg.sender === 'user' ? 'bg-[#FFD83D]' : 'bg-[#B9A7FF]'
                  }`}>
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="max-w-xl comic-border-sm p-4 text-xs sm:text-sm font-bold shadow-comic-sm leading-relaxed space-y-1 bg-[#FFFDF5] text-black">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mb-1 pb-1 border-b border-gray-300">
                      <span>{msg.sender === 'user' ? firstName.toUpperCase() : (agentSettings.customName || `${firstName.toUpperCase()}'S AGENT`)}</span>
                      
                      {msg.sender === 'ai' && (
                        <span className="flex items-center gap-1 font-bold">
                          {msg.provider === 'ollama' && (
                            <span className="bg-green-200 text-black px-1.5 py-0.5 border border-black rounded text-[9px] font-black">
                              🦙 LOCAL ({msg.model || 'llama3.2'})
                            </span>
                          )}
                          {msg.provider === 'gemini' && (
                            <span className="bg-purple-200 text-black px-1.5 py-0.5 border border-black rounded text-[9px] font-black">
                              ✨ CLOUD ({msg.model || 'gemini'})
                            </span>
                          )}
                          {msg.provider === 'groq' && (
                            <span className="bg-amber-200 text-black px-1.5 py-0.5 border border-black rounded text-[9px] font-black">
                              ⚡ BACKUP ({msg.model || 'groq'})
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </span>
                      )}
                    </div>
                    
                    {msg.recalledMemories && msg.recalledMemories.length > 0 && (
                      <div className="bg-[#B9A7FF]/30 comic-border-sm p-2 text-[11px] font-mono text-purple-900 mb-2">
                        🧠 Recalled {msg.recalledMemories.length} private memories for context.
                      </div>
                    )}

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

            <form onSubmit={handleSubmitChat} className="mt-4 pt-3 border-t-3 border-black flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Ask ${agentSettings.customName || firstName + "'s AI"} in ${activeMode.toUpperCase()} mode...`}
                className="comic-input text-xs sm:text-sm flex-1 font-bold"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-comic btn-comic-purple px-6 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">SEND</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: AGENT MEMORIES */}
      {activeTab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white comic-border-lg p-6 shadow-comic space-y-4">
            <h3 className="font-black text-lg uppercase flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#FF5A5F]" />
              <span>ADD AGENT MEMORY</span>
            </h3>
            <form onSubmit={handleAddMemory} className="space-y-3 font-mono text-xs">
              <div>
                <label className="font-bold text-black block mb-1">CATEGORY</label>
                <select
                  value={newMemCategory}
                  onChange={(e: any) => setNewMemCategory(e.target.value)}
                  className="comic-input w-full font-bold"
                >
                  <option value="fact">FACT</option>
                  <option value="preference">PREFERENCE</option>
                  <option value="project">PROJECT</option>
                  <option value="workflow">WORKFLOW</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-black block mb-1">MEMORY CONTENT</label>
                <textarea
                  value={newMemContent}
                  onChange={(e) => setNewMemContent(e.target.value)}
                  placeholder="e.g. User prefers short concise code snippets in TypeScript."
                  className="comic-input w-full h-24 font-bold p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="btn-comic btn-comic-yellow w-full py-2 font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>STORE MEMORY</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white comic-border-lg p-6 shadow-comic space-y-4">
            <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-black">
              <h3 className="font-black text-lg uppercase">ISOLATED USER MEMORIES</h3>
              <div className="flex items-center gap-2 bg-[#FFFDF5] comic-border-sm px-2 py-1">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={memSearch}
                  onChange={(e) => setMemSearch(e.target.value)}
                  placeholder="Filter memories..."
                  className="bg-transparent text-xs font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            {filteredMemories.length === 0 ? (
              <div className="text-center py-12 font-mono text-sm font-bold text-gray-500">
                No memories stored yet. Memories can be added manually or automatically remembered during chat.
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {filteredMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="bg-[#FFFDF5] comic-border-sm p-3 flex items-center justify-between gap-4 font-mono text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                          {mem.category}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-sans text-sm font-bold text-gray-900">{mem.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded comic-border-sm hover:bg-red-50 cursor-pointer"
                      title="Forget Memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUTONOMOUS TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white comic-border-lg p-6 shadow-comic space-y-4">
            <h3 className="font-black text-xl uppercase flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-[#FF5A5F]" />
              <span>LAUNCH AUTONOMOUS AGENT TASK</span>
            </h3>

            <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title (e.g. Audit Study PDFs and prepare a week revision plan)"
                className="comic-input md:col-span-5 text-xs font-bold"
              />
              <input
                type="text"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Optional task instructions..."
                className="comic-input md:col-span-5 text-xs font-bold"
              />
              <button
                type="submit"
                disabled={creatingTask}
                className="btn-comic btn-comic-red md:col-span-2 text-xs font-black uppercase py-2 cursor-pointer"
              >
                {creatingTask ? 'RUNNING...' : 'LAUNCH TASK'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {agentTasks.map((t) => (
              <div key={t.id} className="bg-white comic-border-lg p-5 shadow-comic space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="font-black font-sans text-base text-black">{t.title}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-black ${
                      t.status === 'COMPLETED' ? 'bg-green-300' : 'bg-yellow-300'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">
                    {new Date(t.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {t.resultSummary && (
                  <div className="bg-[#FFFDF5] comic-border-sm p-3 font-sans text-xs font-bold text-gray-800">
                    ⚡ Outcome: {t.resultSummary}
                  </div>
                )}

                <div className="space-y-1">
                  <span className="font-black text-[10px] text-gray-600 uppercase">EXECUTION STEPS:</span>
                  {t.steps.map((s) => (
                    <div key={s.id} className="bg-gray-50 comic-border-sm p-2 flex items-center justify-between">
                      <span>Step {s.stepIndex}: {s.title}</span>
                      <span className="font-bold text-green-700">{s.resultText || s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATIONS */}
      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white comic-border-lg p-6 shadow-comic space-y-4">
            <h3 className="font-black text-lg uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#A855F7]" />
              <span>CREATE AUTOMATION</span>
            </h3>

            <form onSubmit={handleCreateAutomation} className="space-y-3 font-mono text-xs">
              <div>
                <label className="font-bold text-black block mb-1">AUTOMATION TITLE</label>
                <input
                  type="text"
                  value={autoTitle}
                  onChange={(e) => setAutoTitle(e.target.value)}
                  placeholder="e.g. Daily Study Reminder & Recap"
                  className="comic-input w-full font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">PROMPT INSTRUCTION</label>
                <textarea
                  value={autoPrompt}
                  onChange={(e) => setAutoPrompt(e.target.value)}
                  placeholder="e.g. Summarize active study documents and list 3 key focus topics."
                  className="comic-input w-full h-24 font-bold p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-black block mb-1">SCHEDULE</label>
                <select
                  value={autoSchedule}
                  onChange={(e) => setAutoSchedule(e.target.value)}
                  className="comic-input w-full font-bold"
                >
                  <option value="daily">DAILY</option>
                  <option value="weekly">WEEKLY</option>
                  <option value="one-time">ONE-TIME</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-comic btn-comic-purple w-full py-2 font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>SAVE AUTOMATION</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white comic-border-lg p-6 shadow-comic space-y-4">
            <h3 className="font-black text-lg uppercase pb-2 border-b-2 border-black">
              ACTIVE AUTOMATED PROMPTS
            </h3>

            {automations.length === 0 ? (
              <div className="text-center py-12 font-mono text-sm font-bold text-gray-500">
                No automations created yet. Create scheduled prompts to let your agent run recurring tasks automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {automations.map((a) => (
                  <div key={a.id} className="bg-[#FFFDF5] comic-border-sm p-4 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black font-sans text-sm text-black">{a.title}</span>
                        <span className="bg-purple-200 text-black text-[9px] font-black px-2 py-0.5 rounded border border-black uppercase">
                          {a.schedule}
                        </span>
                      </div>
                      <p className="text-gray-700 font-sans text-xs">{a.prompt}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAutomation(a.id, a.enabled)}
                        className={`comic-border-sm px-3 py-1 font-black text-xs cursor-pointer ${
                          a.enabled ? 'bg-green-400 text-black' : 'bg-gray-300 text-black'
                        }`}
                      >
                        {a.enabled ? 'ACTIVE' : 'DISABLED'}
                      </button>

                      <button
                        onClick={() => handleDeleteAutomation(a.id)}
                        className="text-red-600 p-1.5 comic-border-sm hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white comic-border-lg p-6 shadow-comic space-y-4 font-mono text-xs">
          <h3 className="font-black text-lg uppercase pb-2 border-b-2 border-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-700" />
            <span>SECURITY AUDIT & TOOL EXECUTION LOG</span>
          </h3>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 font-bold text-gray-500">
              No audit logs recorded yet. Tool executions and security checks are recorded here in real time.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-[#FFFDF5] comic-border-sm p-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-black bg-black text-white px-2 py-0.5 rounded text-[10px] uppercase mr-2">
                      {log.toolName}
                    </span>
                    <span className="font-bold text-gray-900">{log.actionSummary}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-200 text-black font-black px-2 py-0.5 text-[9px] rounded border border-black">
                      {log.approvalStatus}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AGENT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white comic-border-lg p-6 shadow-comic max-w-2xl mx-auto space-y-6">
          <h3 className="font-black text-xl uppercase pb-2 border-b-2 border-black flex items-center gap-2">
            <Settings className="w-5 h-5 text-black" />
            <span>PERSONAL AI AGENT SETTINGS</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 font-mono text-xs">
            <div>
              <label className="font-bold text-black block mb-1">CUSTOM AGENT NAME</label>
              <input
                type="text"
                value={editCustomName}
                onChange={(e) => setEditCustomName(e.target.value)}
                placeholder="e.g. Jarvis, Nova, Sentinel"
                className="comic-input w-full font-bold"
              />
              <p className="text-[10px] text-gray-600 mt-1">
                Customize how your personal AI agent introduces itself to you.
              </p>
            </div>

            <div>
              <label className="font-bold text-black block mb-1">PERSONALITY & PROMPT STYLE</label>
              <input
                type="text"
                value={editPersonality}
                onChange={(e) => setEditPersonality(e.target.value)}
                placeholder="e.g. helpful, concise, encouraging, technical"
                className="comic-input w-full font-bold"
              />
            </div>

            <div className="flex items-center justify-between bg-[#FFFDF5] comic-border-sm p-4">
              <div>
                <span className="font-black font-sans text-sm block text-black">ENABLE AGENT MEMORY</span>
                <span className="text-[11px] text-gray-600 font-mono">
                  Allow your agent to store preferences, facts, and workflows to personalize answers.
                </span>
              </div>
              <input
                type="checkbox"
                checked={agentSettings.memoryEnabled}
                onChange={(e) => setAgentSettings({ ...agentSettings, memoryEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#FFD83D] cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="btn-comic btn-comic-yellow w-full py-3 font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{savingSettings ? 'SAVING...' : 'SAVE SETTINGS'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
