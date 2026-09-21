import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const session = await db.interviewSession.findFirst({
    where: { id, userId: user.id },
    include: {
      questions: true,
      jobDescription: true,
    },
  });

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  return NextResponse.json({ session });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { questionAnswers } = await req.json(); // Array of { id, userAnswer }

  if (Array.isArray(questionAnswers)) {
    for (const qa of questionAnswers) {
      if (qa.id) {
        await db.interviewQuestion.update({
          where: { id: qa.id },
          data: { userAnswer: qa.userAnswer },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await db.interviewSession.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
