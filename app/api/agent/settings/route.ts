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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true },
    });

    const settings = await AgentEngine.getUserSettings(session.userId, user?.name);
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { customName, personality, responseStyle, memoryEnabled, approvalLevel } = body;

    const updated = await prisma.userAISettings.upsert({
      where: { userId: session.userId },
      update: {
        ...(customName !== undefined && { customName }),
        ...(personality !== undefined && { personality }),
        ...(responseStyle !== undefined && { responseStyle }),
        ...(memoryEnabled !== undefined && { memoryEnabled }),
        ...(approvalLevel !== undefined && { approvalLevel }),
      },
      create: {
        userId: session.userId,
        customName: customName || 'Personal AI',
        personality: personality || 'helpful, precise, encouraging',
        responseStyle: responseStyle || 'detailed',
        memoryEnabled: memoryEnabled ?? true,
        approvalLevel: approvalLevel || 'SUPERVISED',
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 500 });
  }
}
