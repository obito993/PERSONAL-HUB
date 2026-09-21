import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { OllamaClient } from '@/lib/ai/ollama';
import { AIRouter } from '@/lib/ai/router';
import { getSystemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { prompt, mode, history, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(mode || 'GENERAL', context);

    // 1. Try Ollama streaming first if online
    const ollamaHealth = await OllamaClient.getHealth();
    if (ollamaHealth.status === 'ONLINE') {
      try {
        const stream = await OllamaClient.streamText(prompt, systemPrompt, history);
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (ollamaErr) {
        console.warn('[AI CHAT STREAM] Ollama stream failed, falling back to cloud router:', ollamaErr);
      }
    }

    // 2. Fall back to AIRouter for cloud completion (Gemini -> Groq)
    const aiResponse = await AIRouter.generateText({
      prompt,
      mode: mode || 'GENERAL',
      history,
      context,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: aiResponse.result, provider: aiResponse.provider, model: aiResponse.model })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AI CHAT STREAM ERROR]:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
