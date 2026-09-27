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

    const auditLogs = await prisma.agentAuditLog.findMany({
      where: { userId: session.userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return NextResponse.json({ auditLogs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}
