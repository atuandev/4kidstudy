export class LeaderboardEntryDto {
  userId: number;
  name: string;
  avatarUrl: string | null;
  totalScore: number;
  /** Learners with equal scores share a rank; the next rank skips. */
  rank: number;
}

export class LeaderboardResponseDto {
  /** Learners in the grade with points this week, highest first. */
  entries: LeaderboardEntryDto[];
  currentUserId: number;
  /** The user's rank, or 0 when they have no points this week. */
  currentUserRank: number;
  /** Active learners in the grade with no points this week, the user included. */
  unrankedCount: number;
  weekStart: string;
  weekEnd: string;
  grade: string;
}
