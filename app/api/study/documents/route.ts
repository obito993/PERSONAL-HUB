import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MAX_STORAGE_MB = parseInt(process.env.MAX_USER_STORAGE_MB || '1000', 10);
const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;

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
        updatedAt: true,
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

    // Calculate real total storage used by authenticated user
    const totalUsedBytes = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    const availableBytes = Math.max(0, MAX_STORAGE_BYTES - totalUsedBytes);
    const usedPercentage = Math.min(100, Math.round((totalUsedBytes / MAX_STORAGE_BYTES) * 100));

    return NextResponse.json({
      documents: docs,
      storage: {
        usedBytes: totalUsedBytes,
        maxBytes: MAX_STORAGE_BYTES,
        availableBytes,
        usedPercentage,
        maxMb: MAX_STORAGE_MB,
      }
    });

  } catch (err: any) {
    console.error('[API STUDY DOCUMENTS ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch documents' }, { status: 500 });
  }
}
