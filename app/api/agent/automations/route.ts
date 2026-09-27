import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const automations = await prisma.agentAutomation.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ automations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch automations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { title, prompt, schedule } = body;

    if (!title || !prompt) {
      return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 });
    }

    const automation = await prisma.agentAutomation.create({
      data: {
        userId: session.userId,
        title,
        prompt,
        schedule: schedule || 'daily',
        enabled: true,
      },
    });

    return NextResponse.json({ automation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create automation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { id, enabled } = body;

    if (!id) {
      return NextResponse.json({ error: 'Automation ID required' }, { status: 400 });
    }

    const updated = await prisma.agentAutomation.updateMany({
      where: { id, userId: session.userId },
      data: { enabled },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update automation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Automation ID required' }, { status: 400 });
    }

    await prisma.agentAutomation.deleteMany({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete automation' }, { status: 500 });
  }
}
