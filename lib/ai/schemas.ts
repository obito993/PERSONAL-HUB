/**
 * JSON Schemas for AI Structured Outputs
 */

export interface FlashcardItem {
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestionItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudySummaryOutput {
  title: string;
  summary: string;
  keyPoints: string[];
  importantTerms: string[];
  revisionTips: string[];
}

export interface CareerExtractedData {
  company: string;
  role: string;
  location: string;
  salary?: string;
  skills: string[];
  requirements: string[];
  interviewTopics: string[];
  preparationPlan: string[];
}

export interface CodeHintOutput {
  concept: string;
  explanation: string;
  hint: string;
  codeSnippet?: string;
}

// response_format JSON schemas
export const FLASHCARDS_SCHEMA = {
  name: 'flashcards_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      flashcards: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
          },
          required: ['question', 'answer', 'difficulty'],
          additionalProperties: false
        }
      }
    },
    required: ['flashcards'],
    additionalProperties: false
  }
};

export const QUIZ_SCHEMA = {
  name: 'quiz_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: {
              type: 'array',
              items: { type: 'string' }
            },
            correctAnswer: { type: 'integer' },
            explanation: { type: 'string' }
          },
          required: ['question', 'options', 'correctAnswer', 'explanation'],
          additionalProperties: false
        }
      }
    },
    required: ['questions'],
    additionalProperties: false
  }
};

export const SUMMARY_SCHEMA = {
  name: 'summary_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      keyPoints: { type: 'array', items: { type: 'string' } },
      importantTerms: { type: 'array', items: { type: 'string' } },
      revisionTips: { type: 'array', items: { type: 'string' } }
    },
    required: ['title', 'summary', 'keyPoints', 'importantTerms', 'revisionTips'],
    additionalProperties: false
  }
};

export const CAREER_EXTRACT_SCHEMA = {
  name: 'career_extract_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      company: { type: 'string' },
      role: { type: 'string' },
      location: { type: 'string' },
      salary: { type: 'string' },
      skills: { type: 'array', items: { type: 'string' } },
      requirements: { type: 'array', items: { type: 'string' } },
      interviewTopics: { type: 'array', items: { type: 'string' } },
      preparationPlan: { type: 'array', items: { type: 'string' } }
    },
    required: ['company', 'role', 'location', 'salary', 'skills', 'requirements', 'interviewTopics', 'preparationPlan'],
    additionalProperties: false
  }
};
