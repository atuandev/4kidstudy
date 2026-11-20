export class StreakStatsDataPointDto {
  date: string;
  xpEarned: number;
}

export class StreakStatsResponseDto {
  data: StreakStatsDataPointDto[];
  /** XP per day summed over every active learner in the user's grade. */
  gradeData: StreakStatsDataPointDto[];
  totalXP: number;
  /** Active learners in the user's grade, the user included. */
  gradeLearnerCount: number;
  /** Average XP per active learner in the grade over the range, rounded. */
  gradeAverageXP: number;
  days: number;
}
