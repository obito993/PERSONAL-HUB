import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from './config';
import { ChatMessage, ProviderHealth } from './types';

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

    const modelsToTry = [AI_CONFIG.gemini.defaultModel, 'gemini-3.6-flash', 'gemini-3.1-pro-preview', 'gemini-2.5-flash'];
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

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
        });
        if (response && response.text) {
          return { text: response.text, model };
        }
      } catch (err) {
        console.warn(`Gemini model ${model} error:`, err instanceof Error ? err.message : err);
      }
    }

    throw new Error('All Gemini model endpoints failed');
  }
}
