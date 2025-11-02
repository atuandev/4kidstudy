import { Exercise } from './exercise';

export type PronunciationScore = {
  accuracy?: number;
  fluency?: number;
  completeness?: number;
  prosody?: number;
  overall?: number;
  audioUrl?: string;
};

export type AttemptDetail = {
  id: number;
  attemptId: number;
  exerciseId: number;
  isCorrect: boolean;
  selectedOptionId?: number;
  timeSec?: number;
  points: number;
  maxPoints: number;
  attempts: number;
  pronunciation?: PronunciationScore;
  exercise?: Exercise;
  createdAt: string;
  updatedAt: string;
};

export type Attempt = {
  id: number;
  userId: number;
  lessonId: number;
  durationSec?: number;
  totalScore: number;
  maxScore: number;
  accuracyPct: number;
  correctCount: number;
  incorrectCount: number;
  skipCount: number;
  attemptNumber: number;
  isCompleted: boolean;
  details?: AttemptDetail[];
  createdAt: string;
  updatedAt: string;
};

export type CreateAttemptRequest = {
  lessonId: number;
};

export type SubmitExerciseRequest = {
  exerciseId: number;
  isCorrect: boolean;
  selectedOptionId?: number;
  timeSec?: number;
  points?: number;
  pronunciation?: PronunciationScore;
};

export type CompleteAttemptRequest = {
  durationSec: number;
};

