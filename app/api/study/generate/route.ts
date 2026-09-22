import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AIStudyService } from '@/lib/study/ai-study-service';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { documentId, chapterId, mode, forceRefresh } = body;

    if (!documentId || !mode) {
      return NextResponse.json({ error: 'Missing documentId or mode' }, { status: 400 });
    }

    // Verify document ownership
    const doc = await prisma.studyDocument.findFirst({
      where: { id: documentId, userId: session.userId },
      include: {
        chapters: { orderBy: { chapterNumber: 'asc' } }
      }
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 });
    }

    const isFullDoc = !chapterId || chapterId === 'ALL';
    let targetTitle = isFullDoc ? doc.title : 'Chapter';
    let targetContent = isFullDoc ? doc.extractedText : '';
    let targetChapter: any = null;

    if (!isFullDoc) {
      targetChapter = doc.chapters.find(c => c.id === chapterId);
      if (!targetChapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      targetTitle = targetChapter.title;
      targetContent = targetChapter.content;
    }

    // 1. SUMMARIZE MODE
    if (mode === 'SUMMARIZE') {
      if (!forceRefresh && !isFullDoc && targetChapter?.summaryJson) {
        return NextResponse.json({ result: targetChapter.summaryJson, cached: true });
      }

      const summary = await AIStudyService.generateSummary(targetTitle, targetContent, isFullDoc);

      if (!isFullDoc && targetChapter) {
        await prisma.studyChapter.update({
          where: { id: targetChapter.id },
          data: { summaryJson: summary }
        });
      }

      return NextResponse.json({ result: summary, cached: false });
    }

    // 2. EXPLAIN MODE
    if (mode === 'EXPLAIN') {
      if (!forceRefresh && !isFullDoc && targetChapter?.explanationText) {
        return NextResponse.json({ result: targetChapter.explanationText, cached: true });
      }

      const explanation = await AIStudyService.generateExplanation(targetTitle, targetContent, isFullDoc);

      if (!isFullDoc && targetChapter) {
        await prisma.studyChapter.update({
          where: { id: targetChapter.id },
          data: { explanationText: explanation }
        });
      }

      return NextResponse.json({ result: explanation, cached: false });
    }

    // 3. FLASHCARDS MODE
    if (mode === 'FLASHCARDS') {
      const existingCards = await prisma.studyFlashcard.findMany({
        where: {
          userId: session.userId,
          documentId,
          chapterId: isFullDoc ? null : chapterId
        },
        orderBy: { createdAt: 'asc' }
      });

      if (!forceRefresh && existingCards.length > 0) {
        return NextResponse.json({ cards: existingCards, cached: true });
      }

      const generated = await AIStudyService.generateFlashcards(targetTitle, targetContent, isFullDoc);

      // Save cards to DB
      const createdCards = await Promise.all(
        generated.map(card =>
          prisma.studyFlashcard.create({
            data: {
              userId: session.userId,
              documentId,
              chapterId: isFullDoc ? null : chapterId,
              question: card.question,
              answer: card.answer,
              cardType: card.cardType,
            }
          })
        )
      );

      return NextResponse.json({ cards: createdCards, cached: false });
    }

    // 4. QUIZ MODE
    if (mode === 'QUIZ') {
      const existingQuestions = await prisma.studyQuizQuestion.findMany({
        where: {
          userId: session.userId,
          documentId,
          chapterId: isFullDoc ? null : chapterId
        },
        orderBy: { createdAt: 'asc' }
      });

      if (!forceRefresh && existingQuestions.length > 0) {
        return NextResponse.json({
          questions: existingQuestions.map(q => ({
            ...q,
            options: JSON.parse(q.optionsJson)
          })),
          cached: true
        });
      }

      const coveredTopics = existingQuestions.map(q => q.topic);
      const generated = await AIStudyService.generateQuizQuestions(targetTitle, targetContent, coveredTopics);

      const createdQuestions = await Promise.all(
        generated.map(q =>
          prisma.studyQuizQuestion.create({
            data: {
              userId: session.userId,
              documentId,
              chapterId: isFullDoc ? null : chapterId,
              question: q.question,
              optionsJson: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              topic: q.topic,
              sourceSection: q.sourceSection || targetTitle,
            }
          })
        )
      );

      return NextResponse.json({
        questions: createdQuestions.map(q => ({
          ...q,
          options: JSON.parse(q.optionsJson)
        })),
        cached: false
      });
    }

    // 5. KEY POINTS MODE
    if (mode === 'KEY_POINTS') {
      if (!forceRefresh && !isFullDoc && targetChapter?.keyPointsJson) {
        return NextResponse.json({
          keyPoints: JSON.parse(targetChapter.keyPointsJson),
          cached: true
        });
      }

      const keyPoints = await AIStudyService.generateKeyPoints(targetTitle, targetContent, isFullDoc);

      if (!isFullDoc && targetChapter) {
        await prisma.studyChapter.update({
          where: { id: targetChapter.id },
          data: { keyPointsJson: JSON.stringify(keyPoints) }
        });
      }

      return NextResponse.json({ keyPoints, cached: false });
    }

    return NextResponse.json({ error: 'Invalid study mode' }, { status: 400 });

  } catch (err: any) {
    console.error('[API STUDY GENERATE ERROR]', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
