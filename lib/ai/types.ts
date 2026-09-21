export type ProviderName = 'ollama' | 'gemini' | 'groq';

export type AIMode = 'GENERAL' | 'STUDY' | 'CODING' | 'CAREER' | 'WRITING' | 'CREATIVE';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequestOptions {
  prompt: string;
  mode?: AIMode;
  history?: ChatMessage[];
  context?: string;
  systemInstruction?: string;
  providerOverride?: 'auto' | ProviderName;
}

export interface AIResponse {
  result: string;
  provider: ProviderName;
  model: string;
  fallbackOccurred?: boolean;
  fallbackChain?: ProviderName[];
}

export interface ProviderHealth {
  name: ProviderName;
  displayName: string;
  status: 'ONLINE' | 'OFFLINE' | 'CONFIGURED' | 'NOT_CONFIGURED' | 'MODEL_UNAVAILABLE';
  model?: string;
  availableModels?: string[];
  error?: string;
  isLocal: boolean;
}

export interface AllProvidersStatus {
  activeProvider: ProviderName | 'none';
  primaryConfigured: ProviderName;
  providers: Record<ProviderName, ProviderHealth>;
}
