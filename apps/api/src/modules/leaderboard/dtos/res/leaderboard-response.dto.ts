export class LeaderboardEntryDto {
  userId: number;
  name: string;
  avatarUrl: string | null;
  totalScore: number;
  rank: number;
}

export class LeaderboardResponseDto {
  entries: LeaderboardEntryDto[];
  currentUserId: number;
  currentUserRank: number;
  unrankedCount: number;
  weekStart: string;
  weekEnd: string;
  grade: string;
}
