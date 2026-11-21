export class PracticeStatisticsByTypeDto {
  type: string;
  correctCount: number;
  correctOnSecondCount: number;
  incorrectCount: number;
}

export class PracticeStatisticsByTopicDto {
  topicId: number;
  title: string;
  lessonCount: number;
  completeLessonCount: number;
  correctCount: number;
  incorrectCount: number;
}

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

export class PracticeStatisticsResponseDto {
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
  byType: PracticeStatisticsByTypeDto[];
  byTopic: PracticeStatisticsByTopicDto[];
  recentAttempts: PracticeStatisticsRecentAttemptDto[];
}
