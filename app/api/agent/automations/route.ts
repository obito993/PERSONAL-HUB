import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export const maxDuration = 60;

const prisma = new PrismaClient();

function calculateNextRun(schedule: string): Date {
  const now = new Date();
  if (schedule === 'weekly') {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  if (schedule === 'one-time') {
    return new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
  }
  // Default 'daily'
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch automations';
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
    const { title, prompt, schedule } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt instruction is required' }, { status: 400 });
    }

    const cleanSchedule = schedule || 'daily';
    const nextRunAt = calculateNextRun(cleanSchedule);

    const automation = await prisma.agentAutomation.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        prompt: prompt.trim(),
        schedule: cleanSchedule,
        enabled: true,
        nextRunAt,
      },
    });

    // Write audit log
    try {
      await prisma.agentAuditLog.create({
        data: {
          userId: session.userId,
          toolName: 'AUTOMATION_CREATED',
          actionSummary: `Created automation: "${automation.title}" (${automation.schedule})`,
          approvalStatus: 'AUTO_EXECUTED',
          detailsJson: JSON.stringify({ automationId: automation.id, schedule: automation.schedule }),
        },
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, automation });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create automation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { id, enabled, title, prompt, schedule } = body;

    if (!id) {
      return NextResponse.json({ error: 'Automation ID required' }, { status: 400 });
    }

    // Enforce ownership check
    const existing = await prisma.agentAutomation.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof enabled === 'boolean') {
      updateData.enabled = enabled;
      if (enabled && !existing.enabled) {
        updateData.nextRunAt = calculateNextRun(existing.schedule);
      }
    }
    if (title && typeof title === 'string') updateData.title = title.trim();
    if (prompt && typeof prompt === 'string') updateData.prompt = prompt.trim();
    if (schedule && typeof schedule === 'string') {
      updateData.schedule = schedule;
      updateData.nextRunAt = calculateNextRun(schedule);
    }

    const updated = await prisma.agentAutomation.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, automation: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update automation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    let id: string | null = null;
    const { searchParams } = new URL(req.url);
    id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id || null;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Automation ID required' }, { status: 400 });
    }

    // Enforce ownership check
    const existing = await prisma.agentAutomation.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Actual deletion from database
    await prisma.agentAutomation.delete({
      where: { id: existing.id },
    });

    // Write audit log for security audit trail
    try {
      await prisma.agentAuditLog.create({
        data: {
          userId: session.userId,
          toolName: 'AUTOMATION_DELETED',
          actionSummary: `Deleted automation: "${existing.title}"`,
          approvalStatus: 'AUTO_EXECUTED',
          detailsJson: JSON.stringify({ automationId: id, title: existing.title }),
        },
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete automation';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
