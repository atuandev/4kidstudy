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
    prisma.attempt.groupBy.mockResolvedValue([
      { userId: 2, _sum: { totalScore: 30 } },
      { userId: 3, _sum: { totalScore: 50 } },
    ]);

    const result = await service.getWeeklyLeaderboard(2);

    expect(result.entries.map((e) => [e.userId, e.totalScore, e.rank])).toEqual(
      [
        [3, 50, 1],
        [2, 30, 2],
      ],
    );
    expect(result.currentUserId).toBe(2);
    expect(result.currentUserRank).toBe(2);
    expect(result.unrankedCount).toBe(1);
    expect(prisma.attempt.groupBy).toHaveBeenCalledTimes(1);
    expect(prisma.attempt.findMany).not.toHaveBeenCalled();
  });
});

describe('LeaderboardService.getWeeklyLeaderboard ties', () => {
  const prisma = {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    attempt: { groupBy: jest.fn() },
  };
  const service = new LeaderboardService(prisma as unknown as PrismaService);

  it('gives equal scores the same rank and skips the next one', async () => {
    prisma.user.findUnique.mockResolvedValue({
      grade: GradeLevel.GRADE_1,
      name: 'Me',
      avatarUrl: null,
    });
    prisma.user.findMany.mockResolvedValue([
      { id: 1, name: 'Dung', avatarUrl: null },
      { id: 2, name: 'Binh', avatarUrl: null },
      { id: 3, name: 'An', avatarUrl: null },
      { id: 4, name: 'Chi', avatarUrl: null },
      { id: 5, name: 'Em', avatarUrl: null },
    ]);
    prisma.attempt.groupBy.mockResolvedValue([
      { userId: 1, _sum: { totalScore: 100 } },
      { userId: 2, _sum: { totalScore: 80 } },
      { userId: 3, _sum: { totalScore: 80 } },
      { userId: 4, _sum: { totalScore: 50 } },
    ]);

    const result = await service.getWeeklyLeaderboard(5);

    expect(result.entries.map((e) => [e.name, e.rank])).toEqual([
      ['Dung', 1],
      ['An', 2],
      ['Binh', 2],
      ['Chi', 4],
    ]);
    expect(result.currentUserRank).toBe(0);
    expect(result.unrankedCount).toBe(1);
  });
});

describe('LeaderboardService.getStreakStats', () => {
  const prisma = {
    user: { findUnique: jest.fn(), count: jest.fn() },
    streakLog: { findMany: jest.fn() },
  };
  const service = new LeaderboardService(prisma as unknown as PrismaService);

  it('averages the grade XP over every active learner in the grade', async () => {
    const day = new Date('2026-11-20T00:00:00Z');
    prisma.user.findUnique.mockResolvedValue({ grade: GradeLevel.GRADE_5 });
    prisma.user.count.mockResolvedValue(4);
    prisma.streakLog.findMany
      .mockResolvedValueOnce([{ day, xpEarned: 120 }])
      .mockResolvedValueOnce([
        { day, xpEarned: 120 },
        { day, xpEarned: 80 },
      ]);

    const result = await service.getStreakStats(7, 7);

    expect(result.totalXP).toBe(120);
    expect(result.gradeData).toEqual([{ date: '2026-11-20', xpEarned: 200 }]);
    expect(result.gradeLearnerCount).toBe(4);
    expect(result.gradeAverageXP).toBe(50);
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { grade: GradeLevel.GRADE_5, isActive: true },
    });
  });
});
