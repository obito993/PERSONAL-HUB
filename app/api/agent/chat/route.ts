import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AgentEngine } from '@/lib/agent/agent-engine';

export const maxDuration = 60;

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { prompt, providerOverride } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await AgentEngine.processAgentChat(
      session.userId,
      prompt
    );


    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[AGENT CHAT API ERROR]', err);
    return NextResponse.json({ error: err.message || 'Agent chat failed' }, { status: 500 });
  }
}
