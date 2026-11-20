import { ExerciseType } from '@prisma/client';
import { AttemptService } from './attempt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AttemptService.getPracticeStatistics', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    attemptDetail: { count: jest.fn() },
  };
  const service = new AttemptService(prisma as unknown as PrismaService);

  beforeEach(() => jest.clearAllMocks());

  it('builds the stats from two aggregate queries', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        { totalLessonCount: 12, completeLessonCount: 4, totalDurationSec: 900 },
      ])
      .mockResolvedValueOnce([
        {
          type: ExerciseType.LISTENING,
          correctCount: 5,
          correctOnSecondCount: 2,
          incorrectCount: 1,
        },
        {
          type: ExerciseType.SELECT_IMAGE,
          correctCount: 3,
          correctOnSecondCount: 0,
          incorrectCount: 4,
        },
      ]);

    const result = await service.getPracticeStatistics(7);

    expect(result).toEqual({
      completeLessonCount: 4,
      totalLessonCount: 12,
      totalDurationSec: 900,
      totalCorrectCount: 8,
      totalIncorrectCount: 5,
      // Every type, in a fixed order, with zeros for unpractised types.
      byType: [
        {
          type: ExerciseType.SELECT_IMAGE,
          correctCount: 3,
          correctOnSecondCount: 0,
          incorrectCount: 4,
        },
        {
          type: ExerciseType.MULTIPLE_CHOICE,
          correctCount: 0,
          correctOnSecondCount: 0,
          incorrectCount: 0,
        },
        {
          type: ExerciseType.MATCHING,
          correctCount: 0,
          correctOnSecondCount: 0,
          incorrectCount: 0,
        },
        {
          type: ExerciseType.LISTENING,
          correctCount: 5,
          correctOnSecondCount: 2,
          incorrectCount: 1,
        },
        {
          type: ExerciseType.PRONUNCIATION,
          correctCount: 0,
          correctOnSecondCount: 0,
          incorrectCount: 0,
        },
      ],
    });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    expect(prisma.attemptDetail.count).not.toHaveBeenCalled();
  });

  it('returns zeros for a user with no attempts', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        { totalLessonCount: 12, completeLessonCount: 0, totalDurationSec: 0 },
      ])
      .mockResolvedValueOnce([]);

    const result = await service.getPracticeStatistics(7);

    expect(result.totalLessonCount).toBe(12);
    expect(result.totalCorrectCount).toBe(0);
    expect(result.totalIncorrectCount).toBe(0);
    expect(result.byType).toHaveLength(5);
    expect(result.byType.every((t) => t.correctCount === 0)).toBe(true);
  });
});
