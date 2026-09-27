import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from './config';
import { ChatMessage, ProviderHealth } from './types';

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer!));
}

export class GeminiClient {
  private static getClient(): GoogleGenAI | null {
    const key = AI_CONFIG.gemini.apiKey;
    if (!key || key.trim() === '') {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: key.trim() });
    } catch {
      return null;
    }
  }

  public static async getHealth(): Promise<ProviderHealth> {
    const ai = this.getClient();
    if (!ai) {
      return {
        name: 'gemini',
        displayName: 'Gemini (Cloud)',
        status: 'NOT_CONFIGURED',
        model: AI_CONFIG.gemini.defaultModel,
        error: 'GEMINI_API_KEY not set in .env.local',
        isLocal: false,
      };
    }
    return {
      name: 'gemini',
      displayName: 'Gemini (Cloud)',
      status: 'CONFIGURED',
      model: AI_CONFIG.gemini.defaultModel,
      isLocal: false,
    };
  }

  public static async generateText(
    prompt: string,
    systemPrompt?: string,
    history?: ChatMessage[]
  ): Promise<{ text: string; model: string }> {
    const ai = this.getClient();
    if (!ai) {
      throw new Error('Gemini API key is not configured');
    }

    const defaultModel = AI_CONFIG.gemini.defaultModel || 'gemini-2.5-flash';
    const modelsToTry = Array.from(new Set([defaultModel, 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash']));
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (history && history.length > 0) {
      for (const h of history) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser Question:\n${prompt}` : prompt;
    contents.push({
      role: 'user',
      parts: [{ text: fullPrompt }],
    });

    let lastError = 'All Gemini model endpoints failed';
    for (const model of modelsToTry) {
      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model,
            contents,
          }),
          15000,
          `Gemini request timed out after 15s (${model})`
        );
        if (response && response.text) {
          return { text: response.text, model };
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini model ${model} error:`, lastError);
      }
    }

    throw new Error(`Gemini request failed: ${lastError}`);
  }
}
