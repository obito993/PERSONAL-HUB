import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AgentEngine } from '@/lib/agent/agent-engine';

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
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch tasks' }, { status: 500 });
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

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const task = await AgentEngine.createAndRunTask(session.userId, title, description || '');
    return NextResponse.json({ task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create agent task' }, { status: 500 });
  }
}
