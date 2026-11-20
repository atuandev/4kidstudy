import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ExerciseType, GradeLevel, LessonStatus } from '@prisma/client';
import {
  CreateAttemptDto,
  CreateAttemptDetailDto,
  SubmitExerciseDto,
  CompleteAttemptDto,
  SubmitAttemptDto,
  GetAttemptsQueryDto,
  AttemptResponseDto,
  PaginatedAttemptsResponseDto,
  AttemptDetailResponseDto,
  PracticeStatisticsResponseDto,
  PracticeStatisticsByTypeDto,
  DailyPracticeStatsResponseDto,
  DailyPracticeStatsDayDto,
  MostWrongExerciseStatsDto,
} from './dto';
import {
  AttemptWithDetails,
  AttemptDetailWithPronunciation,
} from './interfaces/attempt.interface';

/** Learners are in Vietnam, so a practice "day" follows their clock. */
const PRACTICE_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Exercise types in the order the app lists them. */
const EXERCISE_TYPE_ORDER: ExerciseType[] = [
  ExerciseType.SELECT_IMAGE,
  ExerciseType.MULTIPLE_CHOICE,
  ExerciseType.MATCHING,
  ExerciseType.LISTENING,
  ExerciseType.PRONUNCIATION,
];

/**
 * Every exercise type, in a fixed order, with zeros for types the user has
 * not practised.
 */
function everyExerciseType(
  rows: Array<{
    type: ExerciseType;
    correctCount: number;
    correctOnSecondCount: number;
    incorrectCount: number;
  }>,
): PracticeStatisticsByTypeDto[] {
  const rowByType = new Map(rows.map((row) => [row.type, row]));
  return EXERCISE_TYPE_ORDER.map((type) => {
    const row = rowByType.get(type);
    return {
      type,
      correctCount: row?.correctCount ?? 0,
      correctOnSecondCount: row?.correctOnSecondCount ?? 0,
      incorrectCount: row?.incorrectCount ?? 0,
    };
  });
}

/**
 * Service for handling lesson attempts and exercise submissions
 */
@Injectable()
export class AttemptService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Start a new lesson attempt
   */
  async startAttempt(
    userId: number,
    createAttemptDto: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    const { lessonId } = createAttemptDto;

    // Verify lesson exists
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { exercises: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Calculate attempt number for this user and lesson
    const previousAttempts = await this.prisma.attempt.count({
      where: { userId, lessonId },
    });

    // Calculate max possible score
    const maxScore = lesson.exercises.reduce(
      (sum, exercise) => sum + exercise.points,
      0,
    );

    // Create new attempt
    const attempt = await this.prisma.attempt.create({
      data: {
        userId,
        lessonId,
        attemptNumber: previousAttempts + 1,
        maxScore,
      },
      include: {
        details: {
          include: {
            pronunciation: true,
          },
        },
      },
    });

    return this.mapToAttemptResponse(attempt);
  }

  /**
   * Create an attempt detail record
   */
  async createAttemptDetail(
    createAttemptDetailDto: CreateAttemptDetailDto,
  ): Promise<AttemptDetailResponseDto> {
    const {
      attemptId,
      exerciseId,
      isCorrect,
      selectedOptionId,
      selectedOption2Id,
      timeSec,
      points,
      maxPoints,
      attempts,
      pronunciation,
    } = createAttemptDetailDto;

    // Verify attempt exists
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    // Verify exercise exists
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    // Verify exercise belongs to the lesson in the attempt
    if (exercise.lessonId !== attempt.lessonId) {
      throw new BadRequestException(
        `Exercise ${exerciseId} does not belong to lesson ${attempt.lessonId}`,
      );
    }

    // Calculate points if not provided
    const calculatedPoints = points ?? (isCorrect ? exercise.points : 0);
    const calculatedMaxPoints = maxPoints ?? exercise.points;
    const attemptCount = attempts ?? 1;

    // Create attempt detail
    const detail = await this.prisma.attemptDetail.create({
      data: {
        attemptId,
        exerciseId,
        isCorrect,
        selectedOptionId,
        selectedOption2Id,
        timeSec,
        points: calculatedPoints,
        maxPoints: calculatedMaxPoints,
        attempts: attemptCount,
      },
      include: { pronunciation: true },
    });

    // Create pronunciation score if provided
    if (pronunciation) {
      await this.prisma.pronunciationScore.create({
        data: {
          attemptDetailId: detail.id,
          accuracy: pronunciation.accuracy,
          fluency: pronunciation.fluency,
          completeness: pronunciation.completeness,
          prosody: pronunciation.prosody,
          overall: pronunciation.overall,
          rawJson: pronunciation.rawJson,
          audioUrl: pronunciation.audioUrl,
        },
      });
    }

    // Recalculate attempt statistics
    await this.recalculateAttemptStats(attemptId);

    // Reload detail with pronunciation
    const updatedDetail = await this.prisma.attemptDetail.findUnique({
      where: { id: detail.id },
      include: { pronunciation: true },
    });

    if (!updatedDetail) {
      throw new NotFoundException(
        `AttemptDetail with ID ${detail.id} not found`,
      );
    }

    return this.mapToAttemptDetailResponse(updatedDetail);
  }

  /**
   * Submit an exercise answer within an attempt
   */
  async submitExercise(
    attemptId: number,
    submitExerciseDto: SubmitExerciseDto,
  ): Promise<AttemptDetailResponseDto> {
    const {
      exerciseId,
      isCorrect,
      selectedOptionId,
      selectedOption2Id,
      timeSec,
      points,
      pronunciation,
    } = submitExerciseDto;

    // Verify attempt exists and is not completed
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { lesson: { include: { exercises: true } } },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.isCompleted) {
      throw new BadRequestException('Cannot submit to a completed attempt');
    }

    // Verify exercise belongs to the lesson
    const exercise = attempt.lesson.exercises.find(
      (ex) => ex.id === exerciseId,
    );
    if (!exercise) {
      throw new BadRequestException(
        `Exercise ${exerciseId} does not belong to lesson ${attempt.lessonId}`,
      );
    }

    // Check if this exercise was already answered in this attempt
    const existingDetail = await this.prisma.attemptDetail.findFirst({
      where: { attemptId, exerciseId },
    });

    const calculatedPoints = isCorrect ? (points ?? exercise.points) : 0;
    const attemptCount = existingDetail ? existingDetail.attempts + 1 : 1;

    let detail;
    if (existingDetail) {
      // Update existing detail (this is a retry/second attempt)
      // If first attempt was wrong and we're not providing selectedOption2Id,
      // preserve the first wrong answer in selectedOption2Id
      let selectedOption2IdToSave = selectedOption2Id;

      // If selectedOption2Id is not provided and first attempt was wrong,
      // move the first wrong answer to selectedOption2Id
      if (
        !selectedOption2Id &&
        !existingDetail.isCorrect &&
        existingDetail.selectedOptionId
      ) {
        selectedOption2IdToSave = existingDetail.selectedOptionId;
      }

      // Update existing detail
      detail = await this.prisma.attemptDetail.update({
        where: { id: existingDetail.id },
        data: {
          isCorrect,
          selectedOptionId,
          selectedOption2Id: selectedOption2IdToSave,
          timeSec,
          points: calculatedPoints,
          attempts: attemptCount,
        },
        include: { pronunciation: true },
      });
    } else {
      // Create new detail
      detail = await this.prisma.attemptDetail.create({
        data: {
          attemptId,
          exerciseId,
          isCorrect,
          selectedOptionId,
          selectedOption2Id,
          timeSec,
          points: calculatedPoints,
          maxPoints: exercise.points,
          attempts: attemptCount,
        },
        include: { pronunciation: true },
      });
    }

    // Create pronunciation score if provided
    if (pronunciation && !detail.pronunciation) {
      await this.prisma.pronunciationScore.create({
        data: {
          attemptDetailId: detail.id,
          accuracy: pronunciation.accuracy,
          fluency: pronunciation.fluency,
          completeness: pronunciation.completeness,
          prosody: pronunciation.prosody,
          overall: pronunciation.overall,
          rawJson: pronunciation.rawJson,
          audioUrl: pronunciation.audioUrl,
        },
      });
    } else if (pronunciation && detail.pronunciation) {
      // Update existing pronunciation score
      await this.prisma.pronunciationScore.update({
        where: { attemptDetailId: detail.id },
        data: {
          accuracy: pronunciation.accuracy,
          fluency: pronunciation.fluency,
          completeness: pronunciation.completeness,
          prosody: pronunciation.prosody,
          overall: pronunciation.overall,
          rawJson: pronunciation.rawJson,
          audioUrl: pronunciation.audioUrl,
        },
      });
    }

    // Recalculate attempt statistics
    await this.recalculateAttemptStats(attemptId);

    // Reload detail with pronunciation
    const updatedDetail = await this.prisma.attemptDetail.findUnique({
      where: { id: detail.id },
      include: { pronunciation: true },
    });

    if (!updatedDetail) {
      throw new NotFoundException(
        `AttemptDetail with ID ${detail.id} not found`,
      );
    }

    return this.mapToAttemptDetailResponse(updatedDetail);
  }

  /**
   * Complete an attempt and award XP
   */
  async completeAttempt(
    attemptId: number,
    completeAttemptDto: CompleteAttemptDto,
  ): Promise<AttemptResponseDto> {
    const { durationSec } = completeAttemptDto;

    // Get attempt with details
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        details: true,
        lesson: { include: { exercises: true } },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    if (attempt.isCompleted) {
      throw new BadRequestException('Attempt is already completed');
    }

    // Recalculate final statistics
    await this.recalculateAttemptStats(attemptId);

    // Get updated stats for XP calculation
    const updatedAttemptData = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!updatedAttemptData) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    // Use transaction to ensure atomicity
    const updatedAttempt = await this.prisma.$transaction(async (tx) => {
      // Update attempt as completed
      const completed = await tx.attempt.update({
        where: { id: attemptId },
        data: {
          isCompleted: true,
          durationSec,
        },
        include: {
          details: {
            include: {
              pronunciation: true,
            },
          },
        },
      });

      // Award XP based on the score
      await this.awardXpForAttempt(
        tx,
        attempt.userId,
        attemptId,
        attempt.lessonId,
        updatedAttemptData.totalScore,
      );

      // Update streak
      await this.updateUserStreak(tx, attempt.userId);

      return completed;
    });

    return this.mapToAttemptResponse(updatedAttempt);
  }

  /**
   * Save a finished lesson in one transaction: the completed attempt, every
   * answer (with pronunciation scores), XP and the streak. Nothing is written
   * while the learner plays, so an abandoned lesson leaves no rows behind.
   */
  async submitAttempt(
    userId: number,
    submitAttemptDto: SubmitAttemptDto,
  ): Promise<AttemptResponseDto> {
    const { lessonId, durationSec, answers } = submitAttemptDto;

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        exercises: { include: { options: { select: { id: true } } } },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const exercisesById = new Map(lesson.exercises.map((ex) => [ex.id, ex]));
    const answeredIds = new Set<number>();

    const details = answers.map((answer) => {
      const exercise = exercisesById.get(answer.exerciseId);
      if (!exercise) {
        throw new BadRequestException(
          `Exercise ${answer.exerciseId} does not belong to lesson ${lessonId}`,
        );
      }
      if (answeredIds.has(exercise.id)) {
        throw new BadRequestException(
          `Exercise ${exercise.id} is answered more than once`,
        );
      }
      answeredIds.add(exercise.id);

      const optionIds = new Set(exercise.options.map((option) => option.id));
      for (const optionId of [
        answer.selectedOptionId,
        answer.selectedOption2Id,
      ]) {
        if (optionId !== undefined && !optionIds.has(optionId)) {
          throw new BadRequestException(
            `Option ${optionId} does not belong to exercise ${exercise.id}`,
          );
        }
      }

      // The client scores tries (10 first, 5 second); never trust more than
      // the exercise is worth.
      const points = answer.isCorrect
        ? Math.max(
            0,
            Math.min(answer.points ?? exercise.points, exercise.points),
          )
        : 0;

      return { answer, exercise, points };
    });

    const totalScore = details.reduce((sum, d) => sum + d.points, 0);
    const correctCount = details.filter((d) => d.answer.isCorrect).length;
    const incorrectCount = details.length - correctCount;
    const skipCount = details.filter((d) => d.answer.isSkipped).length;
    const accuracyPct =
      details.length > 0 ? (correctCount / details.length) * 100 : 0;
    const maxScore = lesson.exercises.reduce((sum, ex) => sum + ex.points, 0);

    const attempt = await this.prisma.$transaction(
      async (tx) => {
        const previousAttempts = await tx.attempt.count({
          where: { userId, lessonId },
        });

        const created = await tx.attempt.create({
          data: {
            userId,
            lessonId,
            attemptNumber: previousAttempts + 1,
            maxScore,
            durationSec,
            totalScore,
            correctCount,
            incorrectCount,
            skipCount,
            accuracyPct,
            isCompleted: true,
            details: {
              create: details.map(({ answer, exercise, points }) => ({
                exerciseId: exercise.id,
                isCorrect: answer.isCorrect,
                selectedOptionId: answer.selectedOptionId,
                selectedOption2Id: answer.selectedOption2Id,
                timeSec: answer.timeSec,
                points,
                maxPoints: exercise.points,
                attempts: answer.attempts ?? 1,
                pronunciation: answer.pronunciation
                  ? {
                      create: {
                        accuracy: answer.pronunciation.accuracy,
                        fluency: answer.pronunciation.fluency,
                        completeness: answer.pronunciation.completeness,
                        prosody: answer.pronunciation.prosody,
                        overall: answer.pronunciation.overall,
                        rawJson: answer.pronunciation.rawJson,
                        audioUrl: answer.pronunciation.audioUrl,
                      },
                    }
                  : undefined,
              })),
            },
          },
          include: {
            details: {
              include: { pronunciation: true },
              orderBy: { id: 'asc' },
            },
          },
        });

        await this.awardXpForAttempt(
          tx,
          userId,
          created.id,
          lessonId,
          totalScore,
        );
        await this.updateUserStreak(tx, userId);

        return created;
      },
      // Each answer is its own insert; leave room for a slow database.
      { timeout: 15_000 },
    );

    return this.mapToAttemptResponse(attempt);
  }

  /**
   * Get attempt by ID
   */
  async getAttemptById(attemptId: number): Promise<AttemptResponseDto> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        details: {
          include: {
            pronunciation: true,
            exercise: {
              include: {
                options: true,
              },
            },
          },
          // Answers saved together share a timestamp; id keeps their order.
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Attempt with ID ${attemptId} not found`);
    }

    return this.mapToAttemptResponse(attempt);
  }

  /**
   * Get attempts with pagination and filters
   */
  async getAttempts(
    query: GetAttemptsQueryDto,
  ): Promise<PaginatedAttemptsResponseDto> {
    const { lessonId, userId, page = 1, limit = 10 } = query;

    const where: {
      lessonId?: number;
      userId?: number;
    } = {};
    if (lessonId) where.lessonId = lessonId;
    if (userId) where.userId = userId;

    const [attempts, total] = await Promise.all([
      this.prisma.attempt.findMany({
        where,
        include: {
          details: {
            include: {
              pronunciation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.attempt.count({ where }),
    ]);

    return {
      data: attempts.map((attempt) => this.mapToAttemptResponse(attempt)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user's best attempt for a lesson
   */
  async getBestAttempt(
    userId: number,
    lessonId: number,
  ): Promise<AttemptResponseDto | null> {
    const attempt = await this.prisma.attempt.findFirst({
      where: { userId, lessonId, isCompleted: true },
      include: {
        details: {
          include: {
            pronunciation: true,
          },
        },
      },
      orderBy: [{ totalScore: 'desc' }, { accuracyPct: 'desc' }],
    });

    return attempt ? this.mapToAttemptResponse(attempt) : null;
  }

  /**
   * Get user's attempt history for a lesson
   */
  async getUserLessonAttempts(
    userId: number,
    lessonId: number,
  ): Promise<AttemptResponseDto[]> {
    const attempts = await this.prisma.attempt.findMany({
      where: { userId, lessonId },
      include: {
        details: {
          include: {
            pronunciation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attempts.map((attempt) => this.mapToAttemptResponse(attempt));
  }

  /**
   * Get aggregated practice statistics for a user.
   *
   * Counts only finished attempts (unfinished ones come from the old
   * answer-by-answer flow and were abandoned), on lessons learners can see
   * (published or archived, as the topics list shows), optionally within one
   * grade so the numbers match the practice page they sit on.
   */
  async getPracticeStatistics(
    userId: number,
    grade?: GradeLevel,
  ): Promise<PracticeStatisticsResponseDto> {
    const lessonScope = Prisma.sql`
      l."status" IN ('PUBLISHED', 'ARCHIVED')
      ${grade ? Prisma.sql`AND t."grade"::text = ${grade}` : Prisma.empty}
    `;

    // Three queries, run together. COUNT/SUM return bigint in
    // Postgres, so cast to int for plain numbers.
    const [topicRows, typeRows, recentRows] = await Promise.all([
      // Per topic; the overall totals are the sums of these rows. Right and
      // wrong come from the saved answers, not the attempt's own counters:
      // deleting an exercise deletes its answers but not the counters, and
      // counting answers keeps these totals equal to the per-type ones.
      this.prisma.$queryRaw<
        Array<{
          topicId: number;
          title: string;
          lessonCount: number;
          completeLessonCount: number;
          perfectLessonCount: number;
          attemptCount: number;
          durationSec: number;
          correctCount: number;
          incorrectCount: number;
          skipCount: number;
          totalScore: number;
          maxScore: number;
        }>
      >`
        WITH lessons AS (
          SELECT l."id" AS "lessonId", t."id" AS "topicId"
          FROM "Lesson" l
          JOIN "Topic" t ON t."id" = l."topicId"
          WHERE ${lessonScope}
        ),
        attempts AS (
          SELECT a.*
          FROM "Attempt" a
          JOIN lessons USING ("lessonId")
          WHERE a."userId" = ${userId} AND a."isCompleted" = true
        ),
        per_lesson AS (
          SELECT
            lessons."topicId",
            lessons."lessonId",
            COUNT(a."id") AS "attemptCount",
            BOOL_OR(a."maxScore" > 0 AND a."totalScore" >= a."maxScore")
              AS "isPerfect",
            SUM(a."durationSec") AS "durationSec",
            SUM(a."skipCount") AS "skipCount",
            SUM(a."totalScore") AS "totalScore",
            SUM(a."maxScore") AS "maxScore"
          FROM lessons
          LEFT JOIN attempts a USING ("lessonId")
          GROUP BY lessons."topicId", lessons."lessonId"
        ),
        answers AS (
          SELECT
            a."lessonId",
            COUNT(*) FILTER (WHERE d."isCorrect") AS "correctCount",
            COUNT(*) FILTER (WHERE NOT d."isCorrect") AS "incorrectCount"
          FROM "AttemptDetail" d
          JOIN attempts a ON a."id" = d."attemptId"
          GROUP BY a."lessonId"
        )
        SELECT
          t."id" AS "topicId",
          t."title" AS "title",
          COUNT(*)::int AS "lessonCount",
          COUNT(*) FILTER (WHERE pl."attemptCount" > 0)::int
            AS "completeLessonCount",
          COUNT(*) FILTER (WHERE pl."isPerfect")::int AS "perfectLessonCount",
          COALESCE(SUM(pl."attemptCount"), 0)::int AS "attemptCount",
          COALESCE(SUM(pl."durationSec"), 0)::int AS "durationSec",
          COALESCE(SUM(ans."correctCount"), 0)::int AS "correctCount",
          COALESCE(SUM(ans."incorrectCount"), 0)::int AS "incorrectCount",
          COALESCE(SUM(pl."skipCount"), 0)::int AS "skipCount",
          COALESCE(SUM(pl."totalScore"), 0)::int AS "totalScore",
          COALESCE(SUM(pl."maxScore"), 0)::int AS "maxScore"
        FROM per_lesson pl
        JOIN "Topic" t ON t."id" = pl."topicId"
        LEFT JOIN answers ans ON ans."lessonId" = pl."lessonId"
        GROUP BY t."id", t."title", t."order"
        ORDER BY t."order" ASC, t."id" ASC
      `,
      this.prisma.$queryRaw<
        Array<{
          type: ExerciseType;
          correctCount: number;
          correctOnSecondCount: number;
          incorrectCount: number;
        }>
      >`
        SELECT
          e."type"::text AS "type",
          COUNT(*) FILTER (WHERE d."isCorrect")::int AS "correctCount",
          COUNT(*) FILTER (WHERE d."isCorrect" AND d."attempts" >= 2)::int
            AS "correctOnSecondCount",
          COUNT(*) FILTER (WHERE NOT d."isCorrect")::int AS "incorrectCount"
        FROM "AttemptDetail" d
        JOIN "Attempt" a ON a."id" = d."attemptId"
        JOIN "Exercise" e ON e."id" = d."exerciseId"
        JOIN "Lesson" l ON l."id" = a."lessonId"
        JOIN "Topic" t ON t."id" = l."topicId"
        WHERE a."userId" = ${userId}
          AND a."isCompleted" = true
          AND ${lessonScope}
        GROUP BY e."type"
      `,
      this.prisma.attempt.findMany({
        where: {
          userId,
          isCompleted: true,
          lesson: {
            status: { in: [LessonStatus.PUBLISHED, LessonStatus.ARCHIVED] },
            ...(grade ? { topic: { grade } } : {}),
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 5,
        select: {
          id: true,
          lessonId: true,
          totalScore: true,
          maxScore: true,
          accuracyPct: true,
          createdAt: true,
          lesson: {
            select: { title: true, topic: { select: { title: true } } },
          },
        },
      }),
    ]);

    const sum = (key: keyof (typeof topicRows)[number]) =>
      topicRows.reduce((total, row) => total + Number(row[key]), 0);

    const totalCorrectCount = sum('correctCount');
    const totalIncorrectCount = sum('incorrectCount');
    const totalAnswers = totalCorrectCount + totalIncorrectCount;
    const totalScore = sum('totalScore');
    const maxScore = sum('maxScore');

    const byType = everyExerciseType(typeRows);

    return {
      completeLessonCount: sum('completeLessonCount'),
      totalLessonCount: sum('lessonCount'),
      perfectLessonCount: sum('perfectLessonCount'),
      attemptCount: sum('attemptCount'),
      totalDurationSec: sum('durationSec'),
      totalCorrectCount,
      totalIncorrectCount,
      totalSkipCount: sum('skipCount'),
      totalCorrectOnSecondCount: byType.reduce(
        (total, row) => total + row.correctOnSecondCount,
        0,
      ),
      accuracyPct:
        totalAnswers > 0 ? (totalCorrectCount / totalAnswers) * 100 : 0,
      scorePct: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      byType,
      byTopic: topicRows.map((row) => ({
        topicId: row.topicId,
        title: row.title,
        lessonCount: row.lessonCount,
        completeLessonCount: row.completeLessonCount,
        correctCount: row.correctCount,
        incorrectCount: row.incorrectCount,
      })),
      recentAttempts: recentRows.map((attempt) => ({
        attemptId: attempt.id,
        lessonId: attempt.lessonId,
        lessonTitle: attempt.lesson.title,
        topicTitle: attempt.lesson.topic.title,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        accuracyPct: attempt.accuracyPct,
        createdAt: attempt.createdAt,
      })),
    };
  }

  /**
   * Practice over the last `days` days (Vietnam time, today included): one
   * row per day, zeros on days without practice. Finished attempts only; right and wrong come from saved answers,
   * as in getPracticeStatistics.
   */
  async getDailyPracticeStats(
    userId: number,
    days: number,
  ): Promise<DailyPracticeStatsResponseDto> {
    const firstDay = Prisma.sql`(now() AT TIME ZONE ${PRACTICE_TIME_ZONE})::date - ${days - 1}::int`;
    const finished = Prisma.sql`
      SELECT
        a."id",
        (a."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${PRACTICE_TIME_ZONE})::date
          AS "day",
        a."durationSec"
      FROM "Attempt" a
      WHERE a."userId" = ${userId}
        AND a."isCompleted" = true
        AND a."createdAt" >= now() - ${days + 1}::int * interval '1 day'
    `;

    const dayRows = await this.prisma.$queryRaw<DailyPracticeStatsDayDto[]>`
        WITH days AS (
          SELECT generate_series(
            ${firstDay},
            (now() AT TIME ZONE ${PRACTICE_TIME_ZONE})::date,
            interval '1 day'
          )::date AS "day"
        ),
        finished AS (${finished}),
        per_day AS (
          SELECT "day", COUNT(*) AS "attemptCount", SUM("durationSec") AS "durationSec"
          FROM finished
          GROUP BY "day"
        ),
        answers AS (
          SELECT
            f."day",
            COUNT(*) FILTER (WHERE d."isCorrect") AS "correctCount",
            COUNT(*) FILTER (WHERE NOT d."isCorrect") AS "incorrectCount"
          FROM "AttemptDetail" d
          JOIN finished f ON f."id" = d."attemptId"
          GROUP BY f."day"
        )
        SELECT
          to_char(days."day", 'YYYY-MM-DD') AS "date",
          COALESCE(pd."attemptCount", 0)::int AS "attemptCount",
          COALESCE(pd."durationSec", 0)::int AS "durationSec",
          COALESCE(ans."correctCount", 0)::int AS "correctCount",
          COALESCE(ans."incorrectCount", 0)::int AS "incorrectCount"
        FROM days
        LEFT JOIN per_day pd ON pd."day" = days."day"
        LEFT JOIN answers ans ON ans."day" = days."day"
        ORDER BY days."day" ASC
      `;

    return { days, data: dayRows };
  }

  /**
   * Get most wrong exercises in a lesson for a specific user,
   * including first and second wrong counts.
   */
  async getMostWrongExercisesByLesson(
    userId: number,
    lessonId: number,
  ): Promise<MostWrongExerciseStatsDto[]> {
    const details = await this.prisma.attemptDetail.findMany({
      where: {
        attempt: {
          userId,
        },
        exercise: {
          lessonId,
        },
      },
      include: {
        exercise: {
          select: {
            id: true,
            order: true,
            prompt: true,
          },
        },
        attempt: {
          select: {
            userId: true,
          },
        },
      },
    });

    const statsByExerciseId: Map<number, MostWrongExerciseStatsDto> = new Map();

    details.forEach((detail) => {
      if (!detail.exercise) {
        return;
      }

      const exerciseId = detail.exercise.id;

      const existing = statsByExerciseId.get(exerciseId) ?? {
        exerciseId,
        exerciseOrder: detail.exercise.order,
        exercisePrompt: detail.exercise.prompt ?? undefined,
        firstWrongCount: 0,
        secondWrongCount: 0,
        totalWrongCount: 0,
      };

      if (detail.points === 5) {
        existing.firstWrongCount += 1;
      } else if (detail.points === 0) {
        existing.secondWrongCount += 1;
      }

      existing.totalWrongCount =
        existing.firstWrongCount + existing.secondWrongCount;

      statsByExerciseId.set(exerciseId, existing);
    });

    const stats = Array.from(statsByExerciseId.values());

    return stats.sort((a, b) => b.totalWrongCount - a.totalWrongCount);
  }

  /**
   * Award XP for completing an attempt
   */
  private async awardXpForAttempt(
    tx: Prisma.TransactionClient,
    userId: number,
    attemptId: number,
    lessonId: number,
    totalScore: number,
  ): Promise<void> {
    // Calculate XP based on score (1:1 ratio for now, can be adjusted)
    const xpAmount = totalScore;
    if (xpAmount <= 0) {
      return;
    }
    // Create XP log entry
    await tx.xPLog.create({
      data: {
        userId,
        amount: xpAmount,
        source: 'LESSON_COMPLETE',
        lessonId,
      },
    });
    // Update user's total XP
    await tx.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: xpAmount,
        },
      },
    });
  }

  /**
   * Update user's streak days
   */
  private async updateUserStreak(
    tx: Prisma.TransactionClient,
    userId: number,
  ): Promise<void> {
    // Get today's date at midnight (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // Check if user already has a streak log for today
    const todayLog = await tx.streakLog.findUnique({
      where: {
        userId_day: {
          userId,
          day: today,
        },
      },
    });
    // If already logged today, just update XP earned
    if (todayLog) {
      // Get today's total XP
      const todayXpLogs = await tx.xPLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: today,
          },
        },
      });
      const totalXpToday = todayXpLogs.reduce(
        (sum, log) => sum + log.amount,
        0,
      );
      await tx.streakLog.update({
        where: { id: todayLog.id },
        data: { xpEarned: totalXpToday },
      });
      return;
    }
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Check if user practiced yesterday
    const yesterdayLog = await tx.streakLog.findUnique({
      where: {
        userId_day: {
          userId,
          day: yesterday,
        },
      },
    });
    // Get current user data
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { streakDays: true },
    });
    let newStreakDays: number;
    if (yesterdayLog || user?.streakDays === 0) {
      // Continue or start streak
      newStreakDays = (user?.streakDays || 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreakDays = 1;
    }
    // Update user's streak days
    await tx.user.update({
      where: { id: userId },
      data: { streakDays: newStreakDays },
    });
    // Get today's total XP
    const todayXpLogs = await tx.xPLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });
    const totalXpToday = todayXpLogs.reduce((sum, log) => sum + log.amount, 0);
    // Create today's streak log
    await tx.streakLog.create({
      data: {
        userId,
        day: today,
        xpEarned: totalXpToday,
      },
    });
  }

  /**
   * Recalculate attempt statistics based on details
   */
  private async recalculateAttemptStats(attemptId: number): Promise<void> {
    const details = await this.prisma.attemptDetail.findMany({
      where: { attemptId },
    });

    const totalScore = details.reduce((sum, detail) => sum + detail.points, 0);
    const correctCount = details.filter((d) => d.isCorrect).length;
    const incorrectCount = details.filter((d) => !d.isCorrect).length;
    const skipCount = 0; // Can be calculated based on lesson exercises vs details
    const totalExercises = details.length;
    const accuracyPct =
      totalExercises > 0 ? (correctCount / totalExercises) * 100 : 0;

    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        totalScore,
        correctCount,
        incorrectCount,
        skipCount,
        accuracyPct,
      },
    });
  }

  /**
   * Map Prisma attempt to response DTO
   */
  private mapToAttemptResponse(
    attempt: AttemptWithDetails,
  ): AttemptResponseDto {
    return {
      id: attempt.id,
      userId: attempt.userId,
      lessonId: attempt.lessonId,
      durationSec: attempt.durationSec ?? undefined,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      accuracyPct: attempt.accuracyPct,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      skipCount: attempt.skipCount,
      attemptNumber: attempt.attemptNumber,
      isCompleted: attempt.isCompleted,
      details: attempt.details
        ? attempt.details.map((detail) =>
            this.mapToAttemptDetailResponse(detail),
          )
        : undefined,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    };
  }

  /**
   * Map Prisma attempt detail to response DTO
   */
  private mapToAttemptDetailResponse(
    detail: AttemptDetailWithPronunciation,
  ): AttemptDetailResponseDto {
    const exercise = detail.exercise;
    return {
      id: detail.id,
      attemptId: detail.attemptId,
      exerciseId: detail.exerciseId,
      isCorrect: detail.isCorrect,
      selectedOptionId: detail.selectedOptionId ?? undefined,
      selectedOption2Id: detail.selectedOption2Id ?? undefined,
      timeSec: detail.timeSec ?? undefined,
      points: detail.points,
      maxPoints: detail.maxPoints,
      attempts: detail.attempts,
      pronunciation: detail.pronunciation
        ? {
            accuracy: detail.pronunciation.accuracy ?? undefined,
            fluency: detail.pronunciation.fluency ?? undefined,
            completeness: detail.pronunciation.completeness ?? undefined,
            prosody: detail.pronunciation.prosody ?? undefined,
            overall: detail.pronunciation.overall ?? undefined,
            audioUrl: detail.pronunciation.audioUrl ?? undefined,
          }
        : undefined,
      exercise: exercise
        ? {
            id: exercise.id,
            lessonId: exercise.lessonId,
            type: exercise.type,
            order: exercise.order,
            prompt: exercise.prompt ?? undefined,
            imageUrl: exercise.imageUrl ?? undefined,
            audioUrl: exercise.audioUrl ?? undefined,
            targetText: exercise.targetText ?? undefined,
            hintEn: exercise.hintEn ?? undefined,
            hintVi: exercise.hintVi ?? undefined,
            points: exercise.points,
            difficulty: exercise.difficulty,
            options: exercise.options.map((option) => ({
              id: option.id,
              exerciseId: option.exerciseId,
              text: option.text ?? undefined,
              imageUrl: option.imageUrl ?? undefined,
              audioUrl: option.audioUrl ?? undefined,
              isCorrect: option.isCorrect,
              order: option.order,
              matchKey: option.matchKey ?? undefined,
            })),
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
          }
        : undefined,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
    };
  }
}
