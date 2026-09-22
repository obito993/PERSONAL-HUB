import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { processPDFBuffer } from '@/lib/study/pdf-processor';
import { BlobStudyService } from '@/lib/study/blob-service';

const prisma = new PrismaClient();
const MAX_SIZE_MB = parseInt(process.env.MAX_STUDY_PDF_SIZE_MB || '100', 10);
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

const MAX_USER_STORAGE_MB = parseInt(process.env.MAX_USER_STORAGE_MB || '1000', 10);
const MAX_USER_STORAGE_BYTES = MAX_USER_STORAGE_MB * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true }
    });

    if (!userExists) {
      return NextResponse.json({
        error: 'Your session has expired. Please log in again to continue.',
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

    if (file.size > MAX_BYTES) {
      return NextResponse.json({
        error: `File size exceeds maximum allowed single file limit of ${MAX_SIZE_MB}MB.`
      }, { status: 400 });
    }

    // Storage Quota Check
    const userDocs = await prisma.studyDocument.findMany({
      where: { userId: session.userId },
      select: { fileSize: true }
    });
    const currentUsedBytes = userDocs.reduce((acc, d) => acc + (d.fileSize || 0), 0);

    if (currentUsedBytes + file.size > MAX_USER_STORAGE_BYTES) {
      return NextResponse.json({
        error: 'Not enough study storage available. Delete an existing PDF to free up space.',
        code: 'STORAGE_QUOTA_EXCEEDED'
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const docId = crypto.randomUUID();
    const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

    // 1. Store original PDF in Private Vercel Blob Store (users/{userId}/study/{docId}/original/{filename})
    let blobMetadata: { pathname: string; url: string } | null = null;
    try {
      blobMetadata = await BlobStudyService.uploadPrivatePDF(session.userId, docId, file.name, buffer);
    } catch (blobErr: any) {
      console.warn('[VERCEL BLOB NOTICE] Private Vercel Blob upload warning:', blobErr?.message || blobErr);
      // Fallback: continue database persistence even if local Blob token is unconfigured
    }

    // 2. Extract PDF pages, chapters, and chunks
    const { fullText, pageCount, chapters, chunks } = await processPDFBuffer(buffer, file.name);

    // 3. Save StudyDocument with Vercel Blob reference and chunks to Neon PostgreSQL
    const studyDoc = await prisma.studyDocument.create({
      data: {
        id: docId,
        userId: session.userId,
        title: cleanTitle,
        fileName: file.name,
        fileSize: file.size,
        pageCount,
        extractedText: fullText,
        blobPathname: blobMetadata?.pathname || null,
        blobUrl: blobMetadata?.url || null,
        mimeType: 'application/pdf',
        processingStatus: 'READY',
        processingProgress: 100,
        processedPages: pageCount,
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

    // Save chunks linked to document & chapters
    if (chunks.length > 0) {
      const createdChapters = studyDoc.chapters;
      await Promise.all(
        chunks.map(chunk => {
          const matchingChapter = createdChapters.find(c => c.chapterNumber === chunk.chapterNumber);
          return prisma.studyChunk.create({
            data: {
              documentId: docId,
              chapterId: matchingChapter?.id || null,
              chunkIndex: chunk.chunkIndex,
              pageStart: chunk.pageStart,
              pageEnd: chunk.pageEnd,
              content: chunk.content,
            }
          });
        })
      );
    }

    return NextResponse.json({
      success: true,
      document: studyDoc,
    });

  } catch (err: any) {
    console.error('[API STUDY UPLOAD ERROR]', err);
    return NextResponse.json({
      error: err.message || 'Failed to process PDF upload'
    }, { status: 500 });
  }
}
