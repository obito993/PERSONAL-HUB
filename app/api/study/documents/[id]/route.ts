import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { BlobStudyService } from '@/lib/study/blob-service';

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

    // Strict user isolation check
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
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ document: doc });

  } catch (err: any) {
    console.error('[API STUDY GET DOC ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch document' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const { id } = await params;

    // Strict user isolation check
    const doc = await prisma.studyDocument.findFirst({
      where: { id, userId: session.userId }
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    // 1. Delete private Vercel Blob object
    if (doc.blobUrl || doc.blobPathname) {
      await BlobStudyService.deletePrivatePDF(doc.blobUrl || doc.blobPathname || '');
    }

    // 2. Delete document record and cascading relations in Neon PostgreSQL
    await prisma.studyDocument.delete({
      where: { id: doc.id }
    });

    return NextResponse.json({ success: true, deletedId: id });

  } catch (err: any) {
    console.error('[API STUDY DELETE DOC ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to delete document' }, { status: 500 });
  }
}
