import { GradeLevel, LearningContentType } from '@prisma/client';
import { LearningProgressService } from './learning-progress.service';
import { PrismaService } from '../prisma/prisma.service';

const { FLASHCARD, SENTENCE } = LearningContentType;

describe('LearningProgressService topic progress', () => {
  const prisma = {
    topic: { findMany: jest.fn() },
    flashcard: { findMany: jest.fn() },
    sentenceImage: { findMany: jest.fn() },
    learningProgress: { findMany: jest.fn() },
  };
  const service = new LearningProgressService(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.topic.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.flashcard.findMany.mockResolvedValue([
      { id: 10, topicId: 1 },
      { id: 11, topicId: 1 },
      { id: 12, topicId: 1 },
    ]);
    prisma.sentenceImage.findMany.mockResolvedValue([
      { id: 100, topicId: 1, sentences: [{ id: 1000 }, { id: 1001 }] },
      { id: 101, topicId: 1, sentences: [{ id: 1002 }] },
    ]);
    prisma.learningProgress.findMany.mockResolvedValue([
      {
        contentType: FLASHCARD,
        isMastered: true,
        flashcardId: 10,
        sentenceId: null,
      },
      {
        contentType: FLASHCARD,
        isMastered: false,
        flashcardId: 12,
        sentenceId: null,
      },
      {
        contentType: SENTENCE,
        isMastered: true,
        sentenceId: 1001,
        flashcardId: null,
      },
    ]);
  });

  it('returns progress for every topic in the grade with a fixed number of queries', async () => {
    const result = await service.getTopicsProgressByGrade(
      7,
      GradeLevel.GRADE_3,
    );

    expect(result).toEqual([
      {
        topicId: 1,
        totalFlashcards: 3,
        reviewedFlashcards: 1,
        flashcardProgress: 33.3,
        totalSentences: 3,
        reviewedSentences: 1,
        sentenceProgress: 33.3,
        lastReviewedFlashcardIndex: 2,
        lastReviewedSentenceIndex: 0,
      },
      {
        topicId: 2,
        totalFlashcards: 0,
        reviewedFlashcards: 0,
        flashcardProgress: 0,
        totalSentences: 0,
        reviewedSentences: 0,
        sentenceProgress: 0,
        lastReviewedFlashcardIndex: undefined,
        lastReviewedSentenceIndex: undefined,
      },
    ]);
    expect(prisma.topic.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.learningProgress.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.learningProgress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 7 }),
      }),
    );
  });

  it('returns zero progress for a topic that does not exist', async () => {
    prisma.topic.findMany.mockResolvedValue([]);

    const result = await service.getTopicProgress(7, 999);

    expect(result).toMatchObject({
      topicId: 999,
      totalFlashcards: 0,
      totalSentences: 0,
      flashcardProgress: 0,
      sentenceProgress: 0,
    });
  });
});

describe('LearningProgressService grade learning stats', () => {
  const prisma = {
    topic: { findMany: jest.fn() },
    learningProgress: { findMany: jest.fn() },
    flashcard: { findMany: jest.fn() },
    sentence: { findMany: jest.fn() },
  };
  const service = new LearningProgressService(
    prisma as unknown as PrismaService,
  );

  it('summarises mastered items, completed topics and top topics', async () => {
    prisma.topic.findMany.mockResolvedValue([
      { id: 1, title: 'Animals' },
      { id: 2, title: 'Colors' },
    ]);
    prisma.learningProgress.findMany.mockResolvedValue([
      {
        contentType: FLASHCARD,
        isMastered: true,
        reviewCount: 2,
        flashcard: { id: 10, term: 'cat', topicId: 1 },
        sentence: null,
      },
      {
        contentType: FLASHCARD,
        isMastered: true,
        reviewCount: 5,
        flashcard: { id: 20, term: 'red', topicId: 2 },
        sentence: null,
      },
      {
        contentType: SENTENCE,
        isMastered: true,
        reviewCount: 1,
        flashcard: null,
        sentence: {
          id: 100,
          text: 'I see a cat.',
          sentenceImage: { topicId: 1 },
        },
      },
      {
        contentType: FLASHCARD,
        isMastered: false,
        reviewCount: 9,
        flashcard: { id: 21, term: 'blue', topicId: 2 },
        sentence: null,
      },
    ]);
    prisma.flashcard.findMany.mockResolvedValue([
      { id: 10, topicId: 1 },
      { id: 20, topicId: 2 },
      { id: 21, topicId: 2 },
    ]);
    prisma.sentence.findMany.mockResolvedValue([
      { id: 100, sentenceImage: { topicId: 1 } },
      { id: 200, sentenceImage: { topicId: 2 } },
    ]);

    const stats = await service.getGradeLearningStats(7, GradeLevel.GRADE_1);

    expect(stats.totalReviewed).toBe(3);
    expect(stats.flashcardStats).toMatchObject({ reviewed: 2, total: 3 });
    expect(stats.flashcardStats.percentage).toBeCloseTo(66.67, 1);
    expect(stats.flashcardStats.allItems.map((i) => i.name)).toEqual([
      'red',
      'cat',
    ]);
    expect(stats.sentenceStats).toMatchObject({
      reviewed: 1,
      total: 2,
      percentage: 50,
    });
    expect(stats.topicCount).toBe(1);
    expect(stats.topTopics).toEqual([
      { id: 1, name: 'Animals', reviewCount: 2 },
      { id: 2, name: 'Colors', reviewCount: 2 },
    ]);
    expect(stats.topics).toEqual([
      { id: 1, name: 'Animals' },
      { id: 2, name: 'Colors' },
    ]);
  });
});
