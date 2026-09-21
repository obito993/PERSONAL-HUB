import { OllamaClient } from './ollama';
import { GeminiClient } from './gemini';
import { GroqClient } from './groq';
import { AI_CONFIG } from './config';
import { getSystemPrompt } from './prompts';
import { 
  AIRequestOptions, 
  AIResponse, 
  AllProvidersStatus, 
  ProviderHealth, 
  ProviderName 
} from './types';

export class AIRouter {
  /**
   * Get health status of all 3 providers
   */
  public static async getAllProviderStatus(): Promise<AllProvidersStatus> {
    const [ollama, gemini, groq] = await Promise.all([
      OllamaClient.getHealth(),
      GeminiClient.getHealth(),
      GroqClient.getHealth(),
    ]);

    let activeProvider: ProviderName | 'none' = 'none';
    if (ollama.status === 'ONLINE') activeProvider = 'ollama';
    else if (gemini.status === 'CONFIGURED') activeProvider = 'gemini';
    else if (groq.status === 'CONFIGURED') activeProvider = 'groq';

    return {
      activeProvider,
      primaryConfigured: 'ollama',
      providers: {
        ollama,
        gemini,
        groq,
      },
    };
  }

  /**
   * Generate text response through provider priority cascade (OLLAMA -> GEMINI -> GROQ)
   */
  public static async generateText(options: AIRequestOptions): Promise<AIResponse> {
    const systemPrompt = getSystemPrompt(options.mode || 'GENERAL', options.context);
    const fallbackChain: ProviderName[] = [];

    // Check if user specifically requested a single provider
    const requestedProvider = options.providerOverride && options.providerOverride !== 'auto' 
      ? options.providerOverride 
      : AI_CONFIG.router.primaryProvider;

    // Direct provider override mode
    if (requestedProvider !== 'auto') {
      try {
        if (requestedProvider === 'ollama') {
          const res = await OllamaClient.generateText(options.prompt, systemPrompt, options.history);
          return { result: res.text, provider: 'ollama', model: res.model };
        }
        if (requestedProvider === 'gemini') {
          const res = await GeminiClient.generateText(options.prompt, systemPrompt, options.history);
          return { result: res.text, provider: 'gemini', model: res.model };
        }
        if (requestedProvider === 'groq') {
          const res = await GroqClient.generateText(options.prompt, systemPrompt, options.history);
          return { result: res.text, provider: 'groq', model: res.model };
        }
      } catch (err) {
        if (!AI_CONFIG.router.fallbackEnabled) {
          throw err;
        }
        fallbackChain.push(requestedProvider);
      }
    }

    // 1. Primary Provider: OLLAMA (Local)
    try {
      const ollamaHealth = await OllamaClient.getHealth();
      if (ollamaHealth.status === 'ONLINE') {
        const res = await OllamaClient.generateText(options.prompt, systemPrompt, options.history);
        return {
          result: res.text,
          provider: 'ollama',
          model: res.model,
          fallbackOccurred: fallbackChain.length > 0,
          fallbackChain: fallbackChain.length > 0 ? fallbackChain : undefined,
        };
      } else {
        console.warn(`[AI ROUTER] Ollama local unavailable (${ollamaHealth.error || 'offline'}). Cascading to Gemini...`);
        fallbackChain.push('ollama');
      }
    } catch (err) {
      console.warn('[AI ROUTER] Ollama call failed. Cascading to Gemini cloud:', err instanceof Error ? err.message : err);
      fallbackChain.push('ollama');
    }

    // 2. Secondary Provider: GEMINI (Cloud)
    try {
      const geminiHealth = await GeminiClient.getHealth();
      if (geminiHealth.status === 'CONFIGURED') {
        const res = await GeminiClient.generateText(options.prompt, systemPrompt, options.history);
        return {
          result: res.text,
          provider: 'gemini',
          model: res.model,
          fallbackOccurred: true,
          fallbackChain,
        };
      } else {
        console.warn('[AI ROUTER] Gemini key missing. Cascading to Groq...');
        fallbackChain.push('gemini');
      }
    } catch (err) {
      console.warn('[AI ROUTER] Gemini cloud call failed. Cascading to Groq:', err instanceof Error ? err.message : err);
      fallbackChain.push('gemini');
    }

    // 3. Third Provider: GROQ (Cloud)
    try {
      const groqHealth = await GroqClient.getHealth();
      if (groqHealth.status === 'CONFIGURED') {
        const res = await GroqClient.generateText(options.prompt, systemPrompt, options.history);
        return {
          result: res.text,
          provider: 'groq',
          model: res.model,
          fallbackOccurred: true,
          fallbackChain,
        };
      } else {
        fallbackChain.push('groq');
      }
    } catch (err) {
      console.warn('[AI ROUTER] Groq cloud call failed:', err instanceof Error ? err.message : err);
      fallbackChain.push('groq');
    }

    // All 3 providers failed or are unconfigured — return clean error signal
    throw new Error(
      `🤖 AI SIGNAL OFFLINE: All AI providers (Ollama, Gemini, Groq) are currently unavailable or unconfigured.`
    );
  }

  /**
   * Test an individual provider connection with prompt: "Respond with exactly: <PROVIDER> ONLINE"
   */
  public static async testProvider(provider: ProviderName): Promise<{ success: boolean; message: string }> {
    const testPrompt = `Respond with exactly: ${provider.toUpperCase()} ONLINE`;
    try {
      if (provider === 'ollama') {
        const res = await OllamaClient.generateText(testPrompt);
        return { success: true, message: res.text.trim() };
      }
      if (provider === 'gemini') {
        const res = await GeminiClient.generateText(testPrompt);
        return { success: true, message: res.text.trim() };
      }
      if (provider === 'groq') {
        const res = await GroqClient.generateText(testPrompt);
        return { success: true, message: res.text.trim() };
      }
      return { success: false, message: 'Unknown provider' };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
  }
}
