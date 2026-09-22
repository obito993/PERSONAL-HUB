import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { id } = await params;

    const doc = await prisma.studyDocument.findFirst({
      where: { id, userId: session.userId },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' }
        },
        flashcards: {
          orderBy: { createdAt: 'asc' }
        },
        quizQuestions: {
          orderBy: { createdAt: 'asc' }
        },
        progress: true,
      }
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document: doc });

  } catch (err: any) {
    console.error('[API STUDY GET DOC ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch document' }, { status: 500 });
  }
}
