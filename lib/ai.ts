export interface AIServiceRequest {
  tool: 'chat' | 'summarize' | 'rewrite' | 'email' | 'resume' | 'interview' | 'study_plan' | 'flashcards' | 'quiz' | 'coding';
  prompt: string;
  context?: string;
  providerOverride?: 'auto' | 'ollama' | 'gemini' | 'groq';
}

export interface AIServiceResponse {
  result: string;
  provider?: string;
  model?: string;
  fallbackOccurred?: boolean;
  data?: unknown;
}

export async function processAIRequest(req: AIServiceRequest): Promise<AIServiceResponse> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: req.prompt,
        mode: req.tool?.toUpperCase() || 'GENERAL',
        context: req.context,
        providerOverride: req.providerOverride,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.result) {
        return {
          result: data.result,
          provider: data.provider,
          model: data.model,
          fallbackOccurred: data.fallbackOccurred,
          data: data.data,
        };
      }
      if (data.error) {
        console.error('[DEION AI] Server error:', data.error);
        return { result: `🤖 AI ERROR: ${data.error}` };
      }
    } else {
      const errBody = await res.json().catch(() => ({}));
      console.error('[DEION AI] /api/ai HTTP error', res.status, errBody);
      return { result: `🤖 AI SIGNAL OFFLINE (HTTP ${res.status}): ${errBody?.error || 'Provider processing error'}` };
    }
  } catch (err) {
    console.error('[DEION AI] Network error calling /api/ai:', err);
  }

  return { result: `🤖 AI SIGNAL OFFLINE: Unable to reach DEION HUB AI Server.` };
}
