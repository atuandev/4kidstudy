import { BadRequestException } from '@nestjs/common';
import { ExerciseType, GradeLevel, Prisma } from '@prisma/client';
import { AttemptService } from './attempt.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AttemptService.getPracticeStatistics', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    attempt: { findMany: jest.fn() },
  };
  const service = new AttemptService(prisma as unknown as PrismaService);

  const topicRow = (overrides: Record<string, unknown>) => ({
    topicId: 1,
    title: 'Unit 1',
    lessonCount: 0,
    completeLessonCount: 0,
    perfectLessonCount: 0,
    attemptCount: 0,
    durationSec: 0,
    correctCount: 0,
    incorrectCount: 0,
    skipCount: 0,
    totalScore: 0,
    maxScore: 0,
    ...overrides,
  });

  /** SQL text of the nth raw query, with its parameters. */
  const rawQuery = (n: number) => {
    const [strings, ...values] = prisma.$queryRaw.mock.calls[n] as [
      TemplateStringsArray,
      ...unknown[],
    ];
    return Prisma.sql(strings, ...values);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds up topics, types and recent lessons', async () => {
    const createdAt = new Date('2026-11-20T03:00:00Z');
    prisma.$queryRaw
      .mockResolvedValueOnce([
        topicRow({
          topicId: 1,
          title: 'Unit 1',
          lessonCount: 5,
          completeLessonCount: 3,
          perfectLessonCount: 1,
          attemptCount: 4,
          durationSec: 600,
          correctCount: 6,
          incorrectCount: 3,
          skipCount: 1,
          totalScore: 60,
          maxScore: 80,
        }),
        topicRow({
          topicId: 2,
          title: 'Unit 2',
          lessonCount: 7,
          completeLessonCount: 1,
          attemptCount: 1,
          durationSec: 300,
          correctCount: 2,
          incorrectCount: 2,
          totalScore: 20,
          maxScore: 40,
        }),
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
          correctOnSecondCount: 1,
          incorrectCount: 4,
        },
      ]);
    prisma.attempt.findMany.mockResolvedValueOnce([
      {
        id: 9,
        lessonId: 4,
        totalScore: 70,
        maxScore: 80,
        accuracyPct: 87.5,
        createdAt,
        lesson: { title: 'Lesson 1', topic: { title: 'Unit 1' } },
      },
    ]);

    const result = await service.getPracticeStatistics(7, GradeLevel.GRADE_1);

    expect(result).toEqual({
      completeLessonCount: 4,
      totalLessonCount: 12,
      perfectLessonCount: 1,
      attemptCount: 5,
      totalDurationSec: 900,
      totalCorrectCount: 8,
      totalIncorrectCount: 5,
      totalSkipCount: 1,
      totalCorrectOnSecondCount: 3,
      accuracyPct: (8 / 13) * 100,
      scorePct: (80 / 120) * 100,
      // Every type, in a fixed order, with zeros for unpractised types.
      byType: [
        {
          type: ExerciseType.SELECT_IMAGE,
          correctCount: 3,
          correctOnSecondCount: 1,
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
      byTopic: [
        {
          topicId: 1,
          title: 'Unit 1',
          lessonCount: 5,
          completeLessonCount: 3,
          correctCount: 6,
          incorrectCount: 3,
        },
        {
          topicId: 2,
          title: 'Unit 2',
          lessonCount: 7,
          completeLessonCount: 1,
          correctCount: 2,
          incorrectCount: 2,
        },
      ],
      recentAttempts: [
        {
          attemptId: 9,
          lessonId: 4,
          lessonTitle: 'Lesson 1',
          topicTitle: 'Unit 1',
          totalScore: 70,
          maxScore: 80,
          accuracyPct: 87.5,
          createdAt,
        },
      ],
    });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });

  it('counts finished attempts on visible lessons in the grade only', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    prisma.attempt.findMany.mockResolvedValue([]);

    await service.getPracticeStatistics(7, GradeLevel.GRADE_2);

    for (const n of [0, 1]) {
      const { sql, values } = rawQuery(n);
      expect(sql).toContain(`l."status" IN ('PUBLISHED', 'ARCHIVED')`);
      expect(sql).toContain('t."grade"::text =');
      expect(sql).toContain('"isCompleted" = true');
      expect(values).toContain(GradeLevel.GRADE_2);
      expect(values).toContain(7);
    }
    expect(prisma.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 7,
          isCompleted: true,
          lesson: {
            status: { in: ['PUBLISHED', 'ARCHIVED'] },
            topic: { grade: GradeLevel.GRADE_2 },
          },
        },
        take: 5,
      }),
    );
  });

  it('spans every grade when none is given', async () => {
    prisma.$queryRaw.mockResolvedValue([]);
    prisma.attempt.findMany.mockResolvedValue([]);

    await service.getPracticeStatistics(7);

    expect(rawQuery(0).sql).not.toContain('"grade"');
    const { where } = prisma.attempt.findMany.mock.calls[0][0];
    expect(where.lesson).not.toHaveProperty('topic');
  });

  it('returns zeros for a user with no attempts', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([topicRow({ lessonCount: 12 })])
      .mockResolvedValueOnce([]);
    prisma.attempt.findMany.mockResolvedValueOnce([]);

    const result = await service.getPracticeStatistics(7);

    expect(result.totalLessonCount).toBe(12);
    expect(result.completeLessonCount).toBe(0);
    expect(result.totalCorrectCount).toBe(0);
    expect(result.totalIncorrectCount).toBe(0);
    expect(result.accuracyPct).toBe(0);
    expect(result.scorePct).toBe(0);
    expect(result.byType).toHaveLength(5);
    expect(result.byType.every((t) => t.correctCount === 0)).toBe(true);
    expect(result.recentAttempts).toEqual([]);
  });
});

describe('AttemptService.getDailyPracticeStats', () => {
  const prisma = { $queryRaw: jest.fn() };
  const service = new AttemptService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns every day as queried', async () => {
    const days = [
      {
        date: '2026-11-19',
        attemptCount: 0,
        durationSec: 0,
        correctCount: 0,
        incorrectCount: 0,
      },
      {
        date: '2026-11-20',
        attemptCount: 2,
        durationSec: 300,
        correctCount: 14,
        incorrectCount: 2,
      },
    ];
    prisma.$queryRaw.mockResolvedValueOnce(days);

    const result = await service.getDailyPracticeStats(7, 2);

    expect(result.days).toBe(2);
    expect(result.data).toEqual(days);
    // Finished attempts of this user only, in the requested range.
    const [strings, ...values] = prisma.$queryRaw.mock.calls[0] as [
      TemplateStringsArray,
      ...unknown[],
    ];
    const { sql, values: params } = Prisma.sql(strings, ...values);
    expect(sql).toContain('"isCompleted" = true');
    expect(params).toEqual(expect.arrayContaining([7, 1]));
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
