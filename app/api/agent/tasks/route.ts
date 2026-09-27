import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AgentEngine } from '@/lib/agent/agent-engine';

// Allow up to 60 seconds on Vercel Pro (AI generation can take 20-50s).
// On Vercel Hobby the limit is 10s — if that's the plan, move task execution
// to a background queue. For now, this ensures production compatibility on Pro.
export const maxDuration = 60;

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const tasks = await prisma.agentTask.findMany({
      where: { userId: session.userId },
      include: {
        steps: { orderBy: { stepIndex: 'asc' } },
        auditLogs: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ tasks });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch tasks';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await AgentEngine.createAndRunTask(
      session.userId,
      title.trim(),
      (description || '').trim()
    );

    return NextResponse.json({ task });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create agent task';
    console.error('[TASK ROUTE] POST error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
