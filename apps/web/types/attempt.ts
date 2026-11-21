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

export type AttemptAnswer = {
  exerciseId: number;
  isCorrect: boolean;
  isSkipped?: boolean;
  selectedOptionId?: number;
  selectedOption2Id?: number;
  timeSec?: number;
  points: number;
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

export interface PracticeStatistics {
  completeLessonCount: number;
  totalLessonCount: number;
  perfectLessonCount: number;
  attemptCount: number;
  totalDurationSec: number;
  totalCorrectCount: number;
  totalIncorrectCount: number;
  totalSkipCount: number;
  totalCorrectOnSecondCount: number;
  accuracyPct: number;
  scorePct: number;
  byType: PracticeStatisticsByType[];
  byTopic: PracticeStatisticsByTopic[];
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
  date: string;
  attemptCount: number;
  durationSec: number;
  correctCount: number;
  incorrectCount: number;
}

export interface DailyPracticeStats {
  days: number;
  data: DailyPracticeStatsDay[];
}
