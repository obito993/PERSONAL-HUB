import { AI_CONFIG } from './config';
import { ChatMessage, ProviderHealth } from './types';

export class OllamaClient {
  private static baseUrl = AI_CONFIG.ollama.baseUrl;
  private static defaultModel = AI_CONFIG.ollama.defaultModel;

  /**
   * Check Ollama connectivity and available installed models
   */
  public static async getHealth(): Promise<ProviderHealth> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        return {
          name: 'ollama',
          displayName: 'Ollama (Local)',
          status: 'OFFLINE',
          model: this.defaultModel,
          error: `HTTP ${res.status}: Ollama server unreachable`,
          isLocal: true,
        };
      }

      const data = await res.json();
      const models: string[] = (data.models || []).map((m: { name: string }) => m.name);
      
      // Check if configured model (or base name) is present
      const configuredModel = this.defaultModel;
      const isAvailable = models.some(m => m === configuredModel || m.startsWith(`${configuredModel}:`));

      return {
        name: 'ollama',
        displayName: 'Ollama (Local)',
        status: isAvailable ? 'ONLINE' : 'MODEL_UNAVAILABLE',
        model: configuredModel,
        availableModels: models,
        error: isAvailable 
          ? undefined 
          : `Model "${configuredModel}" not found in Ollama. Available: ${models.join(', ') || 'None'}. Run "ollama pull ${configuredModel}"`,
        isLocal: true,
      };
    } catch (err) {
      return {
        name: 'ollama',
        displayName: 'Ollama (Local)',
        status: 'OFFLINE',
        model: this.defaultModel,
        error: 'Ollama is offline or unreachable at ' + this.baseUrl,
        isLocal: true,
      };
    }
  }

  /**
   * Generate text response from Ollama
   */
  public static async generateText(
    prompt: string,
    systemPrompt?: string,
    history?: ChatMessage[],
    customModel?: string
  ): Promise<{ text: string; model: string }> {
    const health = await this.getHealth();
    if (health.status === 'OFFLINE') {
      throw new Error(`Ollama offline at ${this.baseUrl}`);
    }

    const modelToUse = customModel || (health.availableModels?.[0] || this.defaultModel);

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    if (history && history.length > 0) {
      for (const h of history) {
        messages.push({ role: h.role, content: h.content });
      }
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Ollama API error (HTTP ${res.status}): ${errText || res.statusText}`);
    }

    const json = await res.json();
    const text = json.message?.content || json.response || '';
    if (!text) {
      throw new Error('Ollama returned empty response');
    }

    return { text, model: modelToUse };
  }

  /**
   * Stream response from Ollama using SSE
   */
  public static async streamText(
    prompt: string,
    systemPrompt?: string,
    history?: ChatMessage[],
    customModel?: string
  ): Promise<ReadableStream<Uint8Array>> {
    const health = await this.getHealth();
    if (health.status === 'OFFLINE') {
      throw new Error(`Ollama offline at ${this.baseUrl}`);
    }

    const modelToUse = customModel || (health.availableModels?.[0] || this.defaultModel);

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    if (history && history.length > 0) {
      for (const h of history) {
        messages.push({ role: h.role, content: h.content });
      }
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Ollama stream error: HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const json = JSON.parse(line);
                  const chunk = json.message?.content || json.response || '';
                  if (chunk) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
                  }
                } catch {
                  // ignore partial line parse error
                }
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`));
          controller.close();
        }
      },
    });
  }
}
