import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      documentId, 
      chapterId, 
      type, // 'FLASHCARD_MASTERY' | 'QUIZ_SUBMISSION' | 'MODE_COMPLETED'
      cardId, 
      mastered,
      questionId, 
      userAnswer,
      score,
      total,
      weakTopics
    } = body;

    if (!documentId) {
      return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
    }

    // 1. FLASHCARD MASTERY UPDATE
    if (type === 'FLASHCARD_MASTERY' && cardId) {
      const card = await prisma.studyFlashcard.updateMany({
        where: { id: cardId, userId: session.userId },
        data: { mastered: Boolean(mastered) }
      });
      return NextResponse.json({ success: true, updated: card.count });
    }

    // 2. QUIZ QUESTION ANSWER SUBMISSION
    if (type === 'QUIZ_SUBMISSION' && questionId) {
      const question = await prisma.studyQuizQuestion.findFirst({
        where: { id: questionId, userId: session.userId }
      });

      if (question) {
        const isCorrect = question.correctAnswer === userAnswer;
        await prisma.studyQuizQuestion.update({
          where: { id: questionId },
          data: {
            userAnswer,
            isCorrect,
          }
        });
        return NextResponse.json({ success: true, isCorrect, correctAnswer: question.correctAnswer });
      }
    }

    // 3. OVERALL PROGRESS SYNC
    if (type === 'MODE_COMPLETED' || type === 'QUIZ_SUBMISSION') {
      const existingProgress = await prisma.studyProgress.findFirst({
        where: {
          userId: session.userId,
          documentId,
          chapterId: chapterId || null,
          mode: body.mode || 'QUIZ',
        }
      });

      if (existingProgress) {
        const updated = await prisma.studyProgress.update({
          where: { id: existingProgress.id },
          data: {
            isCompleted: true,
            score: typeof score === 'number' ? score : existingProgress.score,
            total: typeof total === 'number' ? total : existingProgress.total,
            weakTopicsJson: Array.isArray(weakTopics) ? JSON.stringify(weakTopics) : existingProgress.weakTopicsJson,
          }
        });
        return NextResponse.json({ success: true, progress: updated });
      } else {
        const created = await prisma.studyProgress.create({
          data: {
            userId: session.userId,
            documentId,
            chapterId: chapterId || null,
            mode: body.mode || 'QUIZ',
            isCompleted: true,
            score: typeof score === 'number' ? score : 0,
            total: typeof total === 'number' ? total : 0,
            weakTopicsJson: Array.isArray(weakTopics) ? JSON.stringify(weakTopics) : '[]',
          }
        });
        return NextResponse.json({ success: true, progress: created });
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('[API STUDY PROGRESS ERROR]', err);
    return NextResponse.json({ error: err.message || 'Progress update failed' }, { status: 500 });
  }
}
