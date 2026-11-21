export class DailyPracticeStatsDayDto {
  date: string;
  attemptCount: number;
  durationSec: number;
  correctCount: number;
  incorrectCount: number;
}

export class DailyPracticeStatsResponseDto {
  days: number;
  data: DailyPracticeStatsDayDto[];
}
