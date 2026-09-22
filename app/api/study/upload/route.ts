import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { processPDFBuffer } from '@/lib/study/pdf-processor';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // Verify this userId actually exists in the database (guards against stale JWT cookies)
    const userExists = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true }
    });

    if (!userExists) {
      console.warn(`[STUDY UPLOAD] Session userId ${session.userId} not found in database — stale cookie`);
      return NextResponse.json({
        error: 'Your session has expired or is invalid. Please log out and log back in to continue.',
        code: 'SESSION_USER_NOT_FOUND'
      }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process PDF text & detect semantic chapters
    const { fullText, pageCount, chapters } = await processPDFBuffer(buffer, file.name);

    // Save document and chapters in Neon database
    const studyDoc = await prisma.studyDocument.create({
      data: {
        userId: session.userId,
        title: file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        extractedText: fullText,
        chapters: {
          create: chapters.map(ch => ({
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            content: ch.content,
          }))
        }
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      document: studyDoc,
    });

  } catch (err: any) {
    console.error('[API STUDY UPLOAD ERROR]', err);
    // Surface a clean, non-leaking error message
    const isFK = err?.code === 'P2003' || (err?.message || '').includes('Foreign key constraint');
    return NextResponse.json({
      error: isFK
        ? 'Upload failed: Your session may be stale. Please log out and log back in, then try again.'
        : (err.message || 'Failed to process PDF upload')
    }, { status: 500 });
  }
}
