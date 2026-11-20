import { GradeLevel } from '@prisma/client';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LeaderboardService.getWeeklyLeaderboard', () => {
  const prisma = {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    attempt: { groupBy: jest.fn(), findMany: jest.fn() },
  };
  const service = new LeaderboardService(prisma as unknown as PrismaService);

  it('ranks the grade by weekly score with one aggregate query', async () => {
    prisma.user.findUnique.mockResolvedValue({
      grade: GradeLevel.GRADE_1,
      name: 'Me',
      avatarUrl: null,
    });
    prisma.user.findMany.mockResolvedValue([
      { id: 1, name: 'An', avatarUrl: null },
      { id: 2, name: 'Binh', avatarUrl: null },
      { id: 3, name: 'Chi', avatarUrl: null },
    ]);
    // User 1 has no completed attempts this week.
    prisma.attempt.groupBy.mockResolvedValue([
      { userId: 2, _sum: { totalScore: 30 } },
      { userId: 3, _sum: { totalScore: 50 } },
    ]);

    const result = await service.getWeeklyLeaderboard(2);

    expect(result.entries.map((e) => [e.userId, e.totalScore, e.rank])).toEqual(
      [
        [3, 50, 1],
        [2, 30, 2],
        [1, 0, 3],
      ],
    );
    expect(result.currentUserRank).toBe(2);
    expect(prisma.attempt.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.attempt.findMany).not.toHaveBeenCalled();
  });
});
