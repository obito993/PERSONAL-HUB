import { NextResponse } from 'next/server';
import { AIRouter } from '@/lib/ai/router';
import { ProviderName } from '@/lib/ai/types';

export async function POST(req: Request) {
  try {
    const { provider } = await req.json();

    if (!provider || !['ollama', 'gemini', 'groq'].includes(provider)) {
      return NextResponse.json({ error: 'Valid provider (ollama, gemini, groq) is required' }, { status: 400 });
    }

    const testResult = await AIRouter.testProvider(provider as ProviderName);
    return NextResponse.json(testResult);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
