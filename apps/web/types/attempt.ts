import { Exercise } from "./exercise";

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
  selectedOption2Id?: number;
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

/** The final result of one exercise, kept in the quiz store until the lesson ends. */
export type AttemptAnswer = {
  exerciseId: number;
  isCorrect: boolean;
  /** Skipped instead of answered (for example, no microphone). */
  isSkipped?: boolean;
  selectedOptionId?: number;
  selectedOption2Id?: number;
  timeSec?: number;
  points: number;
  /** Tries used: 1 or 2. */
  attempts: number;
  pronunciation?: PronunciationScore;
};

export type SubmitAttemptRequest = {
  lessonId: number;
  durationSec?: number;
  answers: AttemptAnswer[];
};

export interface PracticeStatisticsByType {
  type: string;
  correctCount: number;
  correctOnSecondCount: number;
  incorrectCount: number;
}

export interface PracticeStatistics {
  completeLessonCount: number;
  totalLessonCount: number;
  totalDurationSec: number;
  totalCorrectCount: number;
  totalIncorrectCount: number;
  byType: PracticeStatisticsByType[];
}

export interface MostWrongExerciseStats {
  exerciseId: number;
  exerciseOrder: number;
  exercisePrompt?: string;
  firstWrongCount: number;
  secondWrongCount: number;
  totalWrongCount: number;
}
