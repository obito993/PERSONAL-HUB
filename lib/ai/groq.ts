import { Groq } from 'groq-sdk';
import { AI_CONFIG } from './config';
import { ChatMessage, ProviderHealth } from './types';

export class GroqClient {
  private static getClient(): Groq | null {
    const key = AI_CONFIG.groq.apiKey;
    if (!key || key.trim() === '') {
      return null;
    }
    try {
      return new Groq({ apiKey: key.trim() });
    } catch {
      return null;
    }
  }

  public static async getHealth(): Promise<ProviderHealth> {
    const groq = this.getClient();
    if (!groq) {
      return {
        name: 'groq',
        displayName: 'Groq (Cloud)',
        status: 'NOT_CONFIGURED',
        model: AI_CONFIG.groq.defaultModel,
        error: 'GROQ_API_KEY not set in .env.local',
        isLocal: false,
      };
    }
    return {
      name: 'groq',
      displayName: 'Groq (Cloud)',
      status: 'CONFIGURED',
      model: AI_CONFIG.groq.defaultModel,
      isLocal: false,
    };
  }

  public static async generateText(
    prompt: string,
    systemPrompt?: string,
    history?: ChatMessage[]
  ): Promise<{ text: string; model: string }> {
    const groq = this.getClient();
    if (!groq) {
      throw new Error('Groq API key is not configured');
    }

    const model = AI_CONFIG.groq.defaultModel;
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    if (history && history.length > 0) {
      for (const h of history) {
        messages.push({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content,
        });
      }
    }

    messages.push({ role: 'user', content: prompt });

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      throw new Error('Groq returned empty response');
    }

    return { text: reply, model };
  }
}
