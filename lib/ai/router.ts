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
    const providerErrors: Record<string, string> = {};

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
        providerErrors[requestedProvider] = err instanceof Error ? err.message : String(err);
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
        const errMsg = ollamaHealth.error || 'Ollama offline or unreachable';
        console.warn(`[AI ROUTER] Ollama local unavailable (${errMsg}). Cascading to Gemini...`);
        fallbackChain.push('ollama');
        providerErrors.ollama = errMsg;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('[AI ROUTER] Ollama call failed. Cascading to Gemini cloud:', errMsg);
      fallbackChain.push('ollama');
      providerErrors.ollama = errMsg;
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
        const errMsg = geminiHealth.error || 'Gemini API key not configured';
        console.warn(`[AI ROUTER] Gemini key missing/unconfigured (${errMsg}). Cascading to Groq...`);
        fallbackChain.push('gemini');
        providerErrors.gemini = errMsg;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('[AI ROUTER] Gemini cloud call failed. Cascading to Groq:', errMsg);
      fallbackChain.push('gemini');
      providerErrors.gemini = errMsg;
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
        const errMsg = groqHealth.error || 'Groq API key not configured';
        fallbackChain.push('groq');
        providerErrors.groq = errMsg;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn('[AI ROUTER] Groq cloud call failed:', errMsg);
      fallbackChain.push('groq');
      providerErrors.groq = errMsg;
    }

    // All 3 providers failed or are unconfigured — return clean error signal
    const details = Object.entries(providerErrors)
      .map(([p, e]) => `${p}: ${e}`)
      .join('; ');
    throw new Error(
      `All configured AI providers failed. (${details || 'No active providers available'})`
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
