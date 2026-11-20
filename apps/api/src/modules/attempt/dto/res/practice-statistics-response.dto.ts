/**
 * Statistics breakdown per exercise type
 */
export class PracticeStatisticsByTypeDto {
  type: string;
  correctCount: number;
  correctOnSecondCount: number;
  /** Answers that were not right, skipped ones included. */
  incorrectCount: number;
}

/**
 * Lesson progress and answers within one topic
 */
export class PracticeStatisticsByTopicDto {
  topicId: number;
  title: string;
  lessonCount: number;
  completeLessonCount: number;
  correctCount: number;
  incorrectCount: number;
}

/**
 * One recently finished lesson
 */
export class PracticeStatisticsRecentAttemptDto {
  attemptId: number;
  lessonId: number;
  lessonTitle: string;
  topicTitle: string;
  totalScore: number;
  maxScore: number;
  accuracyPct: number;
  createdAt: Date;
}

/**
 * Response DTO for user's practice statistics.
 * Counts finished attempts only, on the lessons learners can see
 * (published or archived), within the requested grade.
 */
export class PracticeStatisticsResponseDto {
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
  /** Right answers that needed a second try. */
  totalCorrectOnSecondCount: number;
  /** Right answers out of all answers, 0-100. */
  accuracyPct: number;
  /** Points earned out of points possible, 0-100. */
  scorePct: number;
  byType: PracticeStatisticsByTypeDto[];
  byTopic: PracticeStatisticsByTopicDto[];
  /** The 5 most recently finished lessons, newest first. */
  recentAttempts: PracticeStatisticsRecentAttemptDto[];
}
