import { ProviderName } from './types';

export const AI_CONFIG = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_MODEL || 'llama3.2',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    defaultModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    defaultModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  router: {
    primaryProvider: (process.env.AI_PRIMARY_PROVIDER || 'auto').toLowerCase() as 'auto' | ProviderName,
    fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== 'false',
  },
};
