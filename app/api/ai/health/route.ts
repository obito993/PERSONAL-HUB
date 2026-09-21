import { NextResponse } from 'next/server';
import { AIRouter } from '@/lib/ai/router';

export async function GET() {
  try {
    const status = await AIRouter.getAllProviderStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
