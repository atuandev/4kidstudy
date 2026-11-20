import { BadRequestException } from '@nestjs/common';
import { ExerciseType } from '@prisma/client';
import { AttemptService } from './attempt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AttemptService.getPracticeStatistics', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    attemptDetail: { count: jest.fn() },
  };
  const service = new AttemptService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

describe('AttemptService.submitAttempt', () => {
  const lesson = {
    id: 3,
    exercises: [
      { id: 10, points: 10, options: [{ id: 100 }, { id: 101 }] },
      { id: 11, points: 10, options: [{ id: 110 }, { id: 111 }] },
      { id: 12, points: 10, options: [] },
    ],
  };

  const tx = {
    attempt: { count: jest.fn(), create: jest.fn() },
    xPLog: { create: jest.fn(), findMany: jest.fn() },
    user: { update: jest.fn(), findUnique: jest.fn() },
    streakLog: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const prisma = {
    lesson: { findUnique: jest.fn() },
    $transaction: jest.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
  };
  const service = new AttemptService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.lesson.findUnique.mockResolvedValue(lesson);
    tx.attempt.count.mockResolvedValue(2);
    tx.attempt.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        ...data,
        id: 55,
        details: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    tx.xPLog.findMany.mockResolvedValue([]);
    tx.user.findUnique.mockResolvedValue({ streakDays: 0 });
    tx.streakLog.findUnique.mockResolvedValue(null);
  });

  it('saves the completed attempt, its answers, XP and streak together', async () => {
    const result = await service.submitAttempt(7, {
      lessonId: 3,
      durationSec: 90,
      answers: [
        {
          exerciseId: 10,
          isCorrect: true,
          selectedOptionId: 100,
          points: 10,
          attempts: 1,
        },
        {
          exerciseId: 11,
          isCorrect: false,
          selectedOptionId: 111,
          selectedOption2Id: 110,
          points: 5,
          attempts: 2,
        },
        {
          exerciseId: 12,
          isCorrect: false,
          isSkipped: true,
          points: 0,
        },
      ],
    });

    const { data } = tx.attempt.create.mock.calls[0][0];
    expect(data).toMatchObject({
      userId: 7,
      lessonId: 3,
      attemptNumber: 3,
      maxScore: 30,
      durationSec: 90,
      totalScore: 10,
      correctCount: 1,
      incorrectCount: 2,
      skipCount: 1,
      isCompleted: true,
    });
    expect(data.accuracyPct).toBeCloseTo(33.33, 1);
    // A wrong answer earns nothing, whatever the client sent.
    expect(
      data.details.create.map((d: { points: number }) => d.points),
    ).toEqual([10, 0, 0]);
    expect(data.details.create[1]).toMatchObject({
      selectedOptionId: 111,
      selectedOption2Id: 110,
      attempts: 2,
    });
    expect(tx.xPLog.create).toHaveBeenCalledWith({
      data: { userId: 7, amount: 10, source: 'LESSON_COMPLETE', lessonId: 3 },
    });
    expect(tx.streakLog.create).toHaveBeenCalled();
    expect(result.id).toBe(55);
    expect(result.isCompleted).toBe(true);
  });

  it('caps points at what the exercise is worth', async () => {
    await service.submitAttempt(7, {
      lessonId: 3,
      answers: [{ exerciseId: 10, isCorrect: true, points: 999 }],
    });

    const { data } = tx.attempt.create.mock.calls[0][0];
    expect(data.totalScore).toBe(10);
  });

  it('stores pronunciation scores with the answer', async () => {
    await service.submitAttempt(7, {
      lessonId: 3,
      answers: [
        {
          exerciseId: 12,
          isCorrect: true,
          points: 10,
          pronunciation: { accuracy: 90, fluency: 80, overall: 85 },
        },
      ],
    });

    const { data } = tx.attempt.create.mock.calls[0][0];
    expect(data.details.create[0].pronunciation).toEqual({
      create: expect.objectContaining({ accuracy: 90, overall: 85 }),
    });
  });

  it('rejects an exercise from another lesson', async () => {
    await expect(
      service.submitAttempt(7, {
        lessonId: 3,
        answers: [{ exerciseId: 99, isCorrect: true }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an option from another exercise', async () => {
    await expect(
      service.submitAttempt(7, {
        lessonId: 3,
        answers: [{ exerciseId: 10, isCorrect: true, selectedOptionId: 110 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects the same exercise answered twice', async () => {
    await expect(
      service.submitAttempt(7, {
        lessonId: 3,
        answers: [
          { exerciseId: 10, isCorrect: false },
          { exerciseId: 10, isCorrect: true },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
