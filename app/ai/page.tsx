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
  providerUsed?: string;
  modelUsed?: string;
  fallbackChain?: string;
  executionPlanJson?: string;
  validationPassed?: boolean;
  validationNotes?: string;
  errorMessage?: string;
  durationMs?: number;
  createdAt: string;
  steps: { id: string; stepIndex: number; title: string; status: string; resultText?: string; toolName?: string }[];
}

interface AgentAutomation {
  id: string;
  userId?: string;
  title: string;
  prompt: string;
  schedule: string;
  enabled: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  lastRunStatus?: string | null;
  lastRunResult?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

  // Task History Controls & Selection
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'ALL' | 'COMPLETED' | 'RUNNING' | 'FAILED'>('ALL');

  // Task Delete Modals & Feedback
  const [taskToDelete, setTaskToDelete] = useState<AgentTask | null>(null);
  const [bulkDeleteType, setBulkDeleteType] = useState<'SELECTED' | 'COMPLETED' | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


  // Automations State
  const [automations, setAutomations] = useState<AgentAutomation[]>([]);
  const [autoTitle, setAutoTitle] = useState('');
  const [autoPrompt, setAutoPrompt] = useState('');
  const [autoSchedule, setAutoSchedule] = useState('daily');
  const [autoToDelete, setAutoToDelete] = useState<AgentAutomation | null>(null);
  const [deletingAutoId, setDeletingAutoId] = useState<string | null>(null);
  const [autoFeedback, setAutoFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);


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

  const confirmDeleteTask = async () => {
    if (!taskToDelete || deletingTaskId) return;
    const targetId = taskToDelete.id;
    setDeletingTaskId(targetId);

    try {
      const res = await fetch(`/api/agent/tasks?id=${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        setAgentTasks((prev) => prev.filter((t) => t.id !== targetId));
        setSelectedTaskIds((prev) => prev.filter((id) => id !== targetId));
        setTaskToDelete(null);
        setTaskFeedback({ message: 'Autonomous task deleted.', type: 'success' });
        sound.playPop();
        setTimeout(() => setTaskFeedback(null), 4000);
      } else {
        const data = await res.json();
        setTaskFeedback({ message: data.error || 'Failed to delete task.', type: 'error' });
      }
    } catch (err) {
      setTaskFeedback({ message: 'Failed to delete task.', type: 'error' });
    } finally {
      setDeletingTaskId(null);
    }
  };

  const confirmBulkDeleteTasks = async () => {
    if (!bulkDeleteType || isBulkDeleting) return;
    setIsBulkDeleting(true);

    try {
      let url = '/api/agent/tasks';
      let options: RequestInit = {};

      if (bulkDeleteType === 'COMPLETED') {
        url = '/api/agent/tasks?completedOnly=true';
        options = { method: 'DELETE' };
      } else {
        options = {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedTaskIds }),
        };
      }

      const res = await fetch(url, options);
      if (res.ok) {
        const data = await res.json();
        if (bulkDeleteType === 'COMPLETED') {
          setAgentTasks((prev) => prev.filter((t) => t.status !== 'COMPLETED'));
          setSelectedTaskIds((prev) =>
            prev.filter((id) => {
              const task = agentTasks.find((t) => t.id === id);
              return task && task.status !== 'COMPLETED';
            })
          );
        } else {
          const deletedSet = new Set(selectedTaskIds);
          setAgentTasks((prev) => prev.filter((t) => !deletedSet.has(t.id)));
          setSelectedTaskIds([]);
        }

        setBulkDeleteType(null);
        setTaskFeedback({
          message: `Successfully deleted ${data.count || ''} autonomous task(s).`,
          type: 'success',
        });
        sound.playPop();
        setTimeout(() => setTaskFeedback(null), 4000);
      } else {
        const data = await res.json();
        setTaskFeedback({ message: data.error || 'Failed to delete tasks.', type: 'error' });
      }
    } catch (err) {
      setTaskFeedback({ message: 'Failed to delete tasks.', type: 'error' });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filteredTasks = agentTasks.filter((t) => {
    if (taskStatusFilter === 'COMPLETED' && t.status !== 'COMPLETED') return false;
    if (taskStatusFilter === 'FAILED' && t.status !== 'FAILED' && t.status !== 'BLOCKED') return false;
    if (
      taskStatusFilter === 'RUNNING' &&
      t.status !== 'RUNNING' &&
      t.status !== 'PLANNING' &&
      t.status !== 'VALIDATING'
    ) {
      return false;
    }

    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inDesc = (t.description || '').toLowerCase().includes(q);
      const inResult = (t.resultSummary || '').toLowerCase().includes(q);
      return inTitle || inDesc || inResult;
    }

    return true;
  });

  const deletableFilteredTasks = filteredTasks.filter(
    (t) => !['RUNNING', 'PLANNING', 'VALIDATING'].includes(t.status)
  );

  const toggleSelectAllTasks = () => {
    const deletableIds = deletableFilteredTasks.map((t) => t.id);
    const allSelected = deletableIds.length > 0 && deletableIds.every((id) => selectedTaskIds.includes(id));
    if (allSelected) {
      setSelectedTaskIds((prev) => prev.filter((id) => !deletableIds.includes(id)));
    } else {
      setSelectedTaskIds((prev) => Array.from(new Set([...prev, ...deletableIds])));
    }
  };

  const toggleSelectTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
      const res = await fetch('/api/agent/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: !currentEnabled })
      });
      if (res.ok) {
        sound.playPop();
        fetchAutomations();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update automation.');
      }
    } catch (err) {
      alert('Failed to update automation.');
    }
  };

  const confirmDeleteAutomation = async () => {
    if (!autoToDelete || deletingAutoId) return;
    const targetId = autoToDelete.id;
    setDeletingAutoId(targetId);

    try {
      const res = await fetch(`/api/agent/automations?id=${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        setAutomations(prev => prev.filter(a => a.id !== targetId));
        setAutoToDelete(null);
        setAutoFeedback({ message: 'Automation deleted.', type: 'success' });
        sound.playPop();
        setTimeout(() => setAutoFeedback(null), 4000);
      } else {
        const data = await res.json();
        setAutoFeedback({ message: data.error || 'Failed to delete automation.', type: 'error' });
      }
    } catch (err) {
      setAutoFeedback({ message: 'Failed to delete automation.', type: 'error' });
    } finally {
      setDeletingAutoId(null);
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
          {/* TASK LAUNCHER FORM */}
          <div className="bg-white comic-border-lg p-6 shadow-comic space-y-4">
            <h3 className="font-black text-xl uppercase flex items-center gap-2">
              <ListTodo className="w-6 h-6 text-[#FF5A5F]" />
              <span>LAUNCH AUTONOMOUS AGENT TASK</span>
            </h3>
            <p className="font-mono text-xs text-gray-600 font-bold">
              Describe any task. The agent will dynamically plan, select tools if needed, call the AI provider cascade, validate the result, and persist it.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3" id="task-launcher-form">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title (e.g. Create a 3-step SQL JOIN learning plan)"
                  className="comic-input md:col-span-10 text-xs font-bold"
                />
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="btn-comic btn-comic-red md:col-span-2 text-xs font-black uppercase py-2 cursor-pointer"
                >
                  {creatingTask ? 'RUNNING...' : 'LAUNCH TASK'}
                </button>
              </div>
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Optional: detailed instructions, requirements, expected output format..."
                className="comic-input w-full h-20 font-bold text-xs"
              />
            </form>
          </div>

          {/* TASK HISTORY TOOLBAR & CONTROLS */}
          <div className="bg-white comic-border-lg p-6 shadow-comic space-y-4 font-mono text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg uppercase flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-red-500" />
                  <span>AUTONOMOUS TASK HISTORY</span>
                </h3>
                <span className="bg-black text-white text-xs font-black px-2.5 py-0.5 rounded font-mono">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'TASK' : 'TASKS'}
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['ALL', 'COMPLETED', 'RUNNING', 'FAILED'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTaskStatusFilter(filter)}
                    className={`comic-border-sm px-2.5 py-1 text-[10px] font-black cursor-pointer uppercase transition-colors ${
                      taskStatusFilter === filter
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-black hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Banner */}
            {taskFeedback && (
              <div
                className={`comic-border-sm p-3 font-mono text-xs font-bold flex items-center justify-between gap-2 ${
                  taskFeedback.type === 'success'
                    ? 'bg-green-100 text-green-900 border-green-500'
                    : 'bg-red-100 text-red-900 border-red-500'
                }`}
              >
                <span>{taskFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setTaskFeedback(null)}
                  className="text-xs font-black uppercase text-gray-700 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search Input & Bulk Cleanup Actions Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={taskSearchQuery}
                  onChange={(e) => setTaskSearchQuery(e.target.value)}
                  placeholder="Search task title, prompt, or result..."
                  className="comic-input w-full text-xs font-bold pl-8 py-1.5"
                />
                <span className="absolute left-2.5 top-2 text-gray-400">🔍</span>
                {taskSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTaskSearchQuery('')}
                    className="absolute right-2 top-2 text-xs font-black text-gray-400 hover:text-black cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {deletableFilteredTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAllTasks}
                    className="comic-border-sm bg-gray-100 hover:bg-gray-200 text-black px-3 py-1.5 text-xs font-black cursor-pointer"
                  >
                    {deletableFilteredTasks.every((t) => selectedTaskIds.includes(t.id))
                      ? 'DESELECT ALL'
                      : 'SELECT ALL'}
                  </button>
                )}

                {selectedTaskIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBulkDeleteType('SELECTED')}
                    className="comic-border-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs font-black cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE SELECTED ({selectedTaskIds.length})</span>
                  </button>
                )}

                {agentTasks.some((t) => t.status === 'COMPLETED') && (
                  <button
                    type="button"
                    onClick={() => setBulkDeleteType('COMPLETED')}
                    className="comic-border-sm bg-amber-400 hover:bg-amber-500 text-black px-3 py-1.5 text-xs font-black cursor-pointer flex items-center gap-1.5"
                    title="Delete all completed tasks from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE ALL COMPLETED</span>
                  </button>
                )}
              </div>
            </div>

            {/* TASK LIST OR EMPTY STATE */}
            {agentTasks.length === 0 ? (
              <div className="bg-[#FFFDF5] comic-border-md p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto comic-border-sm">
                  <ListTodo className="w-6 h-6 text-red-500" />
                </div>
                <h4 className="font-black text-base uppercase text-black">NO AUTONOMOUS TASKS</h4>
                <p className="font-sans text-xs font-bold text-gray-600 max-w-md mx-auto leading-relaxed">
                  You haven't launched any autonomous tasks yet.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const elem = document.getElementById('task-launcher-form');
                    elem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-comic btn-comic-red px-4 py-2 font-black text-xs uppercase cursor-pointer"
                >
                  LAUNCH A TASK
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-[#FFFDF5] comic-border-md p-8 text-center space-y-2 font-sans font-bold text-xs text-gray-600">
                <p>No autonomous tasks match your current search or status filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTaskSearchQuery('');
                    setTaskStatusFilter('ALL');
                  }}
                  className="text-purple-600 underline font-mono font-black uppercase hover:text-purple-800 cursor-pointer"
                >
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((t) => {
                  const statusColor =
                    t.status === 'COMPLETED'
                      ? 'bg-green-300'
                      : t.status === 'FAILED' || t.status === 'BLOCKED'
                      ? 'bg-red-300'
                      : t.status === 'VALIDATING'
                      ? 'bg-purple-200'
                      : 'bg-yellow-300';

                  const providerBadge =
                    t.providerUsed === 'ollama'
                      ? '🦙 OLLAMA'
                      : t.providerUsed === 'gemini'
                      ? '✨ GEMINI'
                      : t.providerUsed === 'groq'
                      ? '⚡ GROQ'
                      : null;

                  const isRunning = ['RUNNING', 'PLANNING', 'VALIDATING'].includes(t.status);
                  const isSelected = selectedTaskIds.includes(t.id);

                  return (
                    <div
                      key={t.id}
                      className={`bg-white comic-border-lg p-5 shadow-comic space-y-4 font-mono text-xs transition-colors ${
                        isSelected ? 'ring-2 ring-purple-500 bg-purple-50/20' : ''
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between pb-2 border-b-2 border-black gap-4">
                        <div className="flex items-start gap-3">
                          {/* Bulk Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isRunning}
                            onChange={() => toggleSelectTask(t.id)}
                            className="mt-1 w-4 h-4 rounded border-2 border-black text-purple-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isRunning ? 'Cannot select active running task' : 'Select task'}
                          />

                          <div className="space-y-1">
                            <span className="font-black font-sans text-base text-black block">{t.title}</span>
                            {t.description && (
                              <span className="text-gray-600 font-sans text-xs">{t.description}</span>
                            )}
                          </div>
                        </div>

                        {/* Top-Right Status & Delete Task Button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border border-black ${statusColor}`}>
                              {t.status}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {new Date(t.createdAt).toLocaleTimeString()}
                              {t.durationMs ? ` • ${(t.durationMs / 1000).toFixed(1)}s` : ''}
                            </span>
                          </div>

                          {/* Individual DELETE TASK Button */}
                          <button
                            type="button"
                            disabled={isRunning}
                            onClick={() => setTaskToDelete(t)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 comic-border-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isRunning ? 'Cannot delete an active running task' : 'Delete task'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Provider / Model row */}
                      {t.providerUsed && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            {providerBadge || t.providerUsed}
                          </span>
                          <span className="text-[11px] font-bold text-gray-600 font-sans">
                            Model: {t.modelUsed}
                          </span>
                          {t.fallbackChain && JSON.parse(t.fallbackChain).length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded border border-amber-400">
                              FALLBACK: tried {JSON.parse(t.fallbackChain).join(' → ')} first
                            </span>
                          )}
                          {t.validationPassed === true && (
                            <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded border border-green-400">
                              ✓ VALIDATED
                            </span>
                          )}
                        </div>
                      )}

                      {/* Error message */}
                      {(t.status === 'FAILED' || t.status === 'BLOCKED') && t.errorMessage && (
                        <div className="bg-red-50 comic-border-sm p-3 text-red-800 font-sans text-xs font-bold">
                          ❌ FAILURE: {t.errorMessage}
                        </div>
                      )}

                      {/* Actual AI result */}
                      {t.resultSummary && (
                        <div className="space-y-1">
                          <span className="font-black text-[10px] uppercase text-gray-600">
                            {t.status === 'COMPLETED' ? '✅ TASK RESULT:' : '⚡ PARTIAL RESULT:'}
                          </span>
                          <div className="bg-[#FFFDF5] comic-border-sm p-3 font-sans text-sm font-bold text-gray-900 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {t.resultSummary}
                          </div>
                        </div>
                      )}

                      {/* Execution steps */}
                      <div className="space-y-1.5">
                        <span className="font-black text-[10px] text-gray-500 uppercase">EXECUTION STEPS:</span>
                        {t.steps.map((s) => {
                          const stepStatusColor =
                            s.status === 'COMPLETED'
                              ? 'text-green-700'
                              : s.status === 'FAILED'
                              ? 'text-red-600'
                              : 'text-gray-500';
                          return (
                            <div key={s.id} className="bg-gray-50 comic-border-sm p-2.5 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-black">
                                  Step {s.stepIndex}: {s.title}
                                </span>
                                <span className={`font-black text-[10px] ${stepStatusColor}`}>{s.status}</span>
                              </div>
                              {s.resultText && (
                                <p className="text-gray-700 font-sans text-[11px] leading-relaxed whitespace-pre-wrap">
                                  {s.resultText}
                                </p>
                              )}
                              {s.toolName && (
                                <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                                  TOOL: {s.toolName}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SINGLE TASK DELETE CONFIRMATION MODAL */}
          {taskToDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
              <div className="bg-white comic-border-lg p-6 max-w-md w-full shadow-comic space-y-4 font-mono">
                <div className="flex items-center gap-3 border-b-2 border-black pb-3">
                  <div className="bg-red-100 comic-border-sm p-2 text-red-600">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-black uppercase">DELETE AUTONOMOUS TASK?</h3>
                    <p className="text-[11px] font-bold text-gray-500 truncate max-w-[260px]">{taskToDelete.title}</p>
                  </div>
                </div>

                <p className="font-sans text-xs font-bold text-gray-700 leading-relaxed bg-[#FFFDF5] comic-border-sm p-3">
                  Are you sure you want to permanently delete this task?
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTaskToDelete(null)}
                    disabled={!!deletingTaskId}
                    className="btn-comic btn-comic-white px-4 py-2 font-black text-xs uppercase cursor-pointer disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteTask}
                    disabled={!!deletingTaskId}
                    className="btn-comic bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-black text-xs uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {deletingTaskId ? (
                      <span>DELETING...</span>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>DELETE TASK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BULK DELETE CONFIRMATION MODAL */}
          {bulkDeleteType && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
              <div className="bg-white comic-border-lg p-6 max-w-md w-full shadow-comic space-y-4 font-mono">
                <div className="flex items-center gap-3 border-b-2 border-black pb-3">
                  <div className="bg-red-100 comic-border-sm p-2 text-red-600">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-black uppercase">
                      {bulkDeleteType === 'COMPLETED'
                        ? 'DELETE ALL COMPLETED TASKS?'
                        : `DELETE ${selectedTaskIds.length} TASKS?`}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500">Permanent Task History Cleanup</p>
                  </div>
                </div>

                <p className="font-sans text-xs font-bold text-gray-700 leading-relaxed bg-[#FFFDF5] comic-border-sm p-3">
                  {bulkDeleteType === 'COMPLETED'
                    ? 'This will permanently remove all completed autonomous tasks from your history.'
                    : 'These autonomous tasks will be permanently deleted.'}
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBulkDeleteType(null)}
                    disabled={isBulkDeleting}
                    className="btn-comic btn-comic-white px-4 py-2 font-black text-xs uppercase cursor-pointer disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={confirmBulkDeleteTasks}
                    disabled={isBulkDeleting}
                    className="btn-comic bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-black text-xs uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isBulkDeleting ? (
                      <span>DELETING...</span>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>
                          {bulkDeleteType === 'COMPLETED'
                            ? 'DELETE COMPLETED'
                            : `DELETE ${selectedTaskIds.length} TASKS`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <h3 className="font-black text-lg uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span>SAVED AUTOMATED TASKS</span>
              </h3>
              <span className="bg-black text-white text-xs font-black px-2.5 py-0.5 rounded font-mono">
                {automations.length} SAVED
              </span>
            </div>

            {/* Notification Banner */}
            {autoFeedback && (
              <div
                className={`comic-border-sm p-3 font-mono text-xs font-bold flex items-center justify-between gap-2 ${
                  autoFeedback.type === 'success'
                    ? 'bg-green-100 text-green-900 border-green-500'
                    : 'bg-red-100 text-red-900 border-red-500'
                }`}
              >
                <span>{autoFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setAutoFeedback(null)}
                  className="text-xs font-black uppercase text-gray-700 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {automations.length === 0 ? (
              <div className="bg-[#FFFDF5] comic-border-md p-10 text-center space-y-3 font-mono">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto comic-border-sm">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-black text-base uppercase text-black">NO AUTOMATIONS YET</h4>
                <p className="font-sans text-xs font-bold text-gray-600 max-w-md mx-auto leading-relaxed">
                  Create an automation and your Personal AI can run it according to your schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {automations.map((a) => (
                  <div key={a.id} className="bg-[#FFFDF5] comic-border-lg p-4 space-y-3 font-mono text-xs">
                    {/* Header: Title + Schedule Badge + Status */}
                    <div className="flex items-start justify-between gap-4 pb-2 border-b border-gray-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black font-sans text-base text-black">{a.title}</span>
                          <span className="bg-purple-200 text-black text-[9px] font-black px-2 py-0.5 rounded border border-black uppercase">
                            {a.schedule}
                          </span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded border border-black uppercase ${
                              a.enabled ? 'bg-green-300 text-black' : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {a.enabled ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAutomation(a.id, a.enabled)}
                          className={`comic-border-sm px-3 py-1 font-black text-xs cursor-pointer transition-colors ${
                            a.enabled
                              ? 'bg-amber-300 hover:bg-amber-400 text-black'
                              : 'bg-green-400 hover:bg-green-500 text-black'
                          }`}
                        >
                          {a.enabled ? 'PAUSE' : 'RESUME'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setAutoToDelete(a)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 comic-border-sm transition-colors cursor-pointer"
                          title="Delete Automation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Instruction Prompt */}
                    <div className="bg-white comic-border-sm p-3 font-sans text-xs font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">
                      <span className="font-mono text-[10px] font-black text-gray-500 block mb-1 uppercase">INSTRUCTIONS:</span>
                      {a.prompt}
                    </div>

                    {/* Metadata Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-gray-600 border-t border-dashed border-gray-200">
                      <div>
                        <span className="font-bold text-gray-900">Created: </span>
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">Next Run: </span>
                        {a.nextRunAt ? new Date(a.nextRunAt).toLocaleString() : (a.enabled ? 'Scheduled' : 'Paused')}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">Last Run: </span>
                        {a.lastRunAt ? new Date(a.lastRunAt).toLocaleString() : 'Never'}
                        {a.lastRunStatus && (
                          <span className={`ml-1 font-black text-[9px] px-1 rounded ${a.lastRunStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {a.lastRunStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE AUTOMATION CONFIRMATION MODAL */}
      {autoToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white comic-border-lg p-6 max-w-md w-full shadow-comic space-y-4 font-mono">
            <div className="flex items-center gap-3 border-b-2 border-black pb-3">
              <div className="bg-red-100 comic-border-sm p-2 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-black uppercase">Delete this automation?</h3>
                <p className="text-[11px] font-bold text-gray-500 truncate max-w-[260px]">{autoToDelete.title}</p>
              </div>
            </div>

            <p className="font-sans text-xs font-bold text-gray-700 leading-relaxed bg-[#FFFDF5] comic-border-sm p-3">
              Are you sure you want to delete this automation? Scheduled executions will stop and this automation will no longer run.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAutoToDelete(null)}
                disabled={!!deletingAutoId}
                className="btn-comic btn-comic-white px-4 py-2 font-black text-xs uppercase cursor-pointer disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmDeleteAutomation}
                disabled={!!deletingAutoId}
                className="btn-comic bg-red-500 hover:bg-red-600 text-white px-4 py-2 font-black text-xs uppercase cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {deletingAutoId ? (
                  <span>DELETING...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE AUTOMATION</span>
                  </>
                )}
              </button>
            </div>
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
