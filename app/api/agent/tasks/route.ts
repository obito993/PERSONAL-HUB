import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AgentEngine } from '@/lib/agent/agent-engine';

// Allow up to 60 seconds on Vercel Pro (AI generation can take 20-50s).
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
      take: 100,
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    let completedOnly = searchParams.get('completedOnly') === 'true';
    let ids: string[] = [];

    try {
      const body = await req.json();
      if (body.id) id = body.id;
      if (Array.isArray(body.ids)) ids = body.ids;
      if (body.completedOnly) completedOnly = true;
    } catch {
      // Body optional when using searchParams
    }

    // ── Case 1: Delete all completed tasks ─────────────────────────────────
    if (completedOnly) {
      const completedTasks = await prisma.agentTask.findMany({
        where: {
          userId: session.userId,
          status: 'COMPLETED',
        },
        select: { id: true },
      });

      if (completedTasks.length === 0) {
        return NextResponse.json({ error: 'No completed tasks found to delete' }, { status: 404 });
      }

      const deleteRes = await prisma.agentTask.deleteMany({
        where: {
          userId: session.userId,
          status: 'COMPLETED',
        },
      });

      try {
        await prisma.agentAuditLog.create({
          data: {
            userId: session.userId,
            toolName: 'BULK_TASKS_DELETED',
            actionSummary: `Deleted all completed tasks (${deleteRes.count} tasks)`,
            approvalStatus: 'AUTO_EXECUTED',
            detailsJson: JSON.stringify({ count: deleteRes.count, type: 'COMPLETED_ONLY' }),
          },
        });
      } catch {
        // Non-fatal
      }

      return NextResponse.json({ success: true, count: deleteRes.count });
    }

    // ── Case 2: Bulk delete specific task IDs ──────────────────────────────
    if (ids.length > 0) {
      // Safety check: filter out running tasks to protect active execution
      const deletableTasks = await prisma.agentTask.findMany({
        where: {
          id: { in: ids },
          userId: session.userId,
          NOT: {
            status: { in: ['RUNNING', 'PLANNING', 'VALIDATING'] },
          },
        },
        select: { id: true },
      });

      if (deletableTasks.length === 0) {
        return NextResponse.json({ error: 'No valid or deletable tasks found' }, { status: 404 });
      }

      const deletableIds = deletableTasks.map((t) => t.id);
      const deleteRes = await prisma.agentTask.deleteMany({
        where: {
          id: { in: deletableIds },
          userId: session.userId,
        },
      });

      try {
        await prisma.agentAuditLog.create({
          data: {
            userId: session.userId,
            toolName: 'BULK_TASKS_DELETED',
            actionSummary: `Bulk deleted ${deleteRes.count} selected tasks`,
            approvalStatus: 'AUTO_EXECUTED',
            detailsJson: JSON.stringify({ count: deleteRes.count, taskIds: deletableIds }),
          },
        });
      } catch {
        // Non-fatal
      }

      return NextResponse.json({ success: true, count: deleteRes.count });
    }

    // ── Case 3: Single task deletion by ID ─────────────────────────────────
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const task = await prisma.agentTask.findFirst({
      where: { id, userId: session.userId },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Safety check: prevent deleting running tasks while executor is working
    if (['RUNNING', 'PLANNING', 'VALIDATING'].includes(task.status)) {
      return NextResponse.json(
        { error: 'Cannot delete an actively running task. Please wait for it to complete.' },
        { status: 400 }
      );
    }

    await prisma.agentTask.delete({
      where: { id: task.id },
    });

    try {
      await prisma.agentAuditLog.create({
        data: {
          userId: session.userId,
          toolName: 'TASK_DELETED',
          actionSummary: `Deleted autonomous task: "${task.title}"`,
          approvalStatus: 'AUTO_EXECUTED',
          detailsJson: JSON.stringify({ taskId: id, title: task.title }),
        },
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({ success: true, count: 1 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete task';
    console.error('[TASK ROUTE] DELETE error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
