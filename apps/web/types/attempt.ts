import { Exercise, ExerciseType } from "./exercise";

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
  type: ExerciseType;
  correctCount: number;
  correctOnSecondCount: number;
  /** Answers that were not right, skipped ones included. */
  incorrectCount: number;
}

export interface PracticeStatisticsByTopic {
  topicId: number;
  title: string;
  lessonCount: number;
  completeLessonCount: number;
  correctCount: number;
  incorrectCount: number;
}

export interface PracticeStatisticsRecentAttempt {
  attemptId: number;
  lessonId: number;
  lessonTitle: string;
  topicTitle: string;
  totalScore: number;
  maxScore: number;
  accuracyPct: number;
  createdAt: string;
}

/** Finished lessons only, on the lessons the practice page lists for one grade. */
export interface PracticeStatistics {
  completeLessonCount: number;
  totalLessonCount: number;
  /** Lessons with at least one full-score attempt. */
  perfectLessonCount: number;
  /** Finished attempts, retries included. */
  attemptCount: number;
  totalDurationSec: number;
  totalCorrectCount: number;
  /** Answers that were not right, skipped ones included. */
  totalIncorrectCount: number;
  totalSkipCount: number;
  totalCorrectOnSecondCount: number;
  /** 0-100 */
  accuracyPct: number;
  /** Points earned out of points possible, 0-100. */
  scorePct: number;
  byType: PracticeStatisticsByType[];
  byTopic: PracticeStatisticsByTopic[];
  /** Newest first. */
  recentAttempts: PracticeStatisticsRecentAttempt[];
}

export interface MostWrongExerciseStats {
  exerciseId: number;
  exerciseOrder: number;
  exercisePrompt?: string;
  firstWrongCount: number;
  secondWrongCount: number;
  totalWrongCount: number;
}

export interface DailyPracticeStatsDay {
  /** YYYY-MM-DD in Vietnam time. */
  date: string;
  attemptCount: number;
  durationSec: number;
  correctCount: number;
  /** Answers that were not right, skipped ones included. */
  incorrectCount: number;
}

/** Practice over the last N days: every day, zeros included. */
export interface DailyPracticeStats {
  days: number;
  data: DailyPracticeStatsDay[];
}
