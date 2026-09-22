import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // Strict user isolation check
    const docs = await prisma.studyDocument.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileSize: true,
        pageCount: true,
        processingStatus: true,
        processingProgress: true,
        blobPathname: true,
        createdAt: true,
        chapters: {
          select: {
            id: true,
            chapterNumber: true,
            title: true,
          },
          orderBy: { chapterNumber: 'asc' }
        },
        progress: true,
      }
    });

    return NextResponse.json({ documents: docs });

  } catch (err: any) {
    console.error('[API STUDY DOCUMENTS ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch documents' }, { status: 500 });
  }
}
