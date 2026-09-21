import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await db.jobApplication.updateMany({
    where: { id, userId: user.id },
    data: {
      status: body.status,
      notes: body.notes,
      salary: body.salary,
      interviewDate: body.interviewDate ? new Date(body.interviewDate) : undefined,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      recruiter: body.recruiter,
    },
  });

  return NextResponse.json({ success: true, updatedCount: updated.count });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await db.jobApplication.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
