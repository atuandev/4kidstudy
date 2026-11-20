/**
 * Finished lessons and answers on one day (Vietnam time)
 */
export class DailyPracticeStatsDayDto {
  /** YYYY-MM-DD in Asia/Ho_Chi_Minh. */
  date: string;
  attemptCount: number;
  durationSec: number;
  correctCount: number;
  /** Answers that were not right, skipped ones included. */
  incorrectCount: number;
}

/**
 * Response DTO for practice statistics over the last N days
 */
export class DailyPracticeStatsResponseDto {
  days: number;
  /** Every day in the range, oldest first, with zeros on days without practice. */
  data: DailyPracticeStatsDayDto[];
}
