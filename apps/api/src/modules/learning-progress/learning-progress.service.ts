import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GradeLevel, LearningContentType, Prisma } from '@prisma/client';
import {
  CreateLearningProgressDto,
  UpdateLearningProgressDto,
  GetLearningProgressQueryDto,
  ReviewContentDto,
  LearningProgressResponseDto,
  PaginatedLearningProgressResponseDto,
  LearningProgressStatsResponseDto,
  TopicProgressResponseDto,
  GradeLearningStatsResponseDto,
  GradeContentStatsDto,
  GradeStatsItemDto,
} from './dtos';

@Injectable()
export class LearningProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateProgress(
    userId: number,
    createDto: CreateLearningProgressDto,
  ): Promise<LearningProgressResponseDto> {
    const { contentType, flashcardId, sentenceId } = createDto;

    if (contentType === LearningContentType.FLASHCARD && !flashcardId) {
      throw new BadRequestException(
        'flashcardId is required for FLASHCARD content type',
      );
    }

    if (contentType === LearningContentType.SENTENCE && !sentenceId) {
      throw new BadRequestException(
        'sentenceId is required for SENTENCE content type',
      );
    }

    const existingProgress = await this.prisma.learningProgress.findFirst({
      where: {
        userId,
        contentType,
        ...(flashcardId && { flashcardId }),
        ...(sentenceId && { sentenceId }),
      },
      include: {
        flashcard: flashcardId
          ? {
              select: {
                id: true,
                term: true,
                meaningVi: true,
                imageUrl: true,
                audioUrl: true,
              },
            }
          : false,
        sentence: sentenceId
          ? {
              select: {
                id: true,
                text: true,
                meaningVi: true,
                audioUrl: true,
              },
            }
          : false,
      },
    });

    if (existingProgress) {
      return this.mapToProgressResponse(existingProgress);
    }

    if (flashcardId) {
      const flashcard = await this.prisma.flashcard.findUnique({
        where: { id: flashcardId },
      });
      if (!flashcard) {
        throw new NotFoundException(
          `Flashcard with ID ${flashcardId} not found`,
        );
      }
    }

    if (sentenceId) {
      const sentence = await this.prisma.sentence.findUnique({
        where: { id: sentenceId },
      });
      if (!sentence) {
        throw new NotFoundException(`Sentence with ID ${sentenceId} not found`);
      }
    }

    const progress = await this.prisma.learningProgress.create({
      data: {
        userId,
        contentType,
        flashcardId,
        sentenceId,
      },
      include: {
        flashcard: flashcardId
          ? {
              select: {
                id: true,
                term: true,
                meaningVi: true,
                imageUrl: true,
                audioUrl: true,
              },
            }
          : false,
        sentence: sentenceId
          ? {
              select: {
                id: true,
                text: true,
                meaningVi: true,
                audioUrl: true,
              },
            }
          : false,
      },
    });

    return this.mapToProgressResponse(progress);
  }

  async reviewContent(
    userId: number,
    reviewDto: ReviewContentDto,
  ): Promise<LearningProgressResponseDto> {
    const { contentType, flashcardId, sentenceId, isMastered } = reviewDto;

    let progress = await this.prisma.learningProgress.findFirst({
      where: {
        userId,
        contentType,
        ...(flashcardId && { flashcardId }),
        ...(sentenceId && { sentenceId }),
      },
    });

    if (!progress) {
      progress = await this.prisma.learningProgress.create({
        data: {
          userId,
          contentType,
          flashcardId,
          sentenceId,
          reviewCount: 0,
          isMastered: false,
        },
      });
    }

    const updatedProgress = await this.prisma.learningProgress.update({
      where: { id: progress.id },
      data: {
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
        ...(isMastered !== undefined && { isMastered }),
      },
      include: {
        flashcard: flashcardId
          ? {
              select: {
                id: true,
                term: true,
                meaningVi: true,
                imageUrl: true,
                audioUrl: true,
              },
            }
          : false,
        sentence: sentenceId
          ? {
              select: {
                id: true,
                text: true,
                meaningVi: true,
                audioUrl: true,
              },
            }
          : false,
      },
    });

    return this.mapToProgressResponse(updatedProgress);
  }

  async getProgressById(
    id: number,
    userId: number,
  ): Promise<LearningProgressResponseDto> {
    const progress = await this.prisma.learningProgress.findFirst({
      where: { id, userId },
      include: {
        flashcard: {
          select: {
            id: true,
            term: true,
            meaningVi: true,
            imageUrl: true,
            audioUrl: true,
          },
        },
        sentence: {
          select: {
            id: true,
            text: true,
            meaningVi: true,
            audioUrl: true,
          },
        },
      },
    });

    if (!progress) {
      throw new NotFoundException(`Learning progress with ID ${id} not found`);
    }

    return this.mapToProgressResponse(progress);
  }

  async getUserProgress(
    userId: number,
    query: GetLearningProgressQueryDto,
  ): Promise<PaginatedLearningProgressResponseDto> {
    const {
      page = 1,
      limit = 10,
      contentType,
      flashcardId,
      sentenceId,
      isMastered,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(contentType && { contentType }),
      ...(flashcardId && { flashcardId }),
      ...(sentenceId && { sentenceId }),
      ...(isMastered !== undefined && { isMastered }),
    };

    const [data, total] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastReviewedAt: 'desc' },
        include: {
          flashcard: {
            select: {
              id: true,
              term: true,
              meaningVi: true,
              imageUrl: true,
              audioUrl: true,
              topicId: true,
              topic: {
                select: {
                  id: true,
                  grade: true,
                },
              },
            },
          },
          sentence: {
            select: {
              id: true,
              text: true,
              meaningVi: true,
              audioUrl: true,
              sentenceImageId: true,
              sentenceImage: {
                select: {
                  id: true,
                  topicId: true,
                  topic: {
                    select: {
                      id: true,
                      grade: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.learningProgress.count({ where }),
    ]);

    return {
      data: data.map((progress) => this.mapToProgressResponse(progress)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateProgress(
    id: number,
    userId: number,
    updateDto: UpdateLearningProgressDto,
  ): Promise<LearningProgressResponseDto> {
    const progress = await this.prisma.learningProgress.findFirst({
      where: { id, userId },
    });

    if (!progress) {
      throw new NotFoundException(`Learning progress with ID ${id} not found`);
    }

    const updated = await this.prisma.learningProgress.update({
      where: { id },
      data: {
        ...updateDto,
        ...(updateDto.lastReviewedAt && {
          lastReviewedAt: new Date(updateDto.lastReviewedAt),
        }),
      },
      include: {
        flashcard: progress.flashcardId
          ? {
              select: {
                id: true,
                term: true,
                meaningVi: true,
                imageUrl: true,
                audioUrl: true,
              },
            }
          : false,
        sentence: progress.sentenceId
          ? {
              select: {
                id: true,
                text: true,
                meaningVi: true,
                audioUrl: true,
              },
            }
          : false,
      },
    });

    return this.mapToProgressResponse(updated);
  }

  async deleteProgress(id: number, userId: number): Promise<void> {
    const progress = await this.prisma.learningProgress.findFirst({
      where: { id, userId },
    });

    if (!progress) {
      throw new NotFoundException(`Learning progress with ID ${id} not found`);
    }

    await this.prisma.learningProgress.delete({
      where: { id },
    });
  }

  async getUserStats(
    userId: number,
  ): Promise<LearningProgressStatsResponseDto> {
    const [totalReviewed, flashcardTotal, sentenceTotal] = await Promise.all([
      this.prisma.learningProgress.count({
        where: { userId },
      }),
      this.prisma.learningProgress.count({
        where: { userId, contentType: LearningContentType.FLASHCARD },
      }),
      this.prisma.learningProgress.count({
        where: { userId, contentType: LearningContentType.SENTENCE },
      }),
    ]);

    return {
      totalReviewed,
      flashcardStats: {
        total: flashcardTotal,
      },
      sentenceStats: {
        total: sentenceTotal,
      },
    };
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  private mapToProgressResponse(progress: any): LearningProgressResponseDto {
    const flashcard = progress.flashcard
      ? {
          id: progress.flashcard.id,
          term: progress.flashcard.term,
          meaningVi: progress.flashcard.meaningVi,
          imageUrl: progress.flashcard.imageUrl ?? undefined,
          audioUrl: progress.flashcard.audioUrl ?? undefined,
          ...(progress.flashcard.topicId && {
            topicId: progress.flashcard.topicId,
          }),
          ...(progress.flashcard.topic && {
            topic: progress.flashcard.topic,
          }),
        }
      : undefined;

    const sentence = progress.sentence
      ? {
          id: progress.sentence.id,
          text: progress.sentence.text,
          meaningVi: progress.sentence.meaningVi ?? undefined,
          audioUrl: progress.sentence.audioUrl ?? undefined,
          ...(progress.sentence.sentenceImageId && {
            sentenceImageId: progress.sentence.sentenceImageId,
          }),
          ...(progress.sentence.sentenceImage && {
            sentenceImage: progress.sentence.sentenceImage,
          }),
        }
      : undefined;

    return {
      id: progress.id,
      userId: progress.userId,
      reviewCount: progress.reviewCount,
      isMastered: progress.isMastered,
      lastReviewedAt: progress.lastReviewedAt ?? undefined,
      contentType: progress.contentType,
      flashcardId: progress.flashcardId ?? undefined,
      sentenceId: progress.sentenceId ?? undefined,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
      ...(flashcard && { flashcard }),
      ...(sentence && { sentence }),
    } as LearningProgressResponseDto;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

  async getTopicProgress(
    userId: number,
    topicId: number,
  ): Promise<TopicProgressResponseDto> {
    const [progress] = await this.computeTopicProgress(userId, {
      id: topicId,
    });
    return progress ?? buildTopicProgress(topicId, [], [], []);
  }

  async getTopicsProgressByGrade(
    userId: number,
    grade: GradeLevel,
  ): Promise<TopicProgressResponseDto[]> {
    return this.computeTopicProgress(userId, { grade });
  }

  async getGradeLearningStats(
    userId: number,
    grade: GradeLevel,
  ): Promise<GradeLearningStatsResponseDto> {
    const [topics, progresses, flashcards, sentences] = await Promise.all([
      this.prisma.topic.findMany({
        where: { grade },
        orderBy: [{ order: 'asc' }],
        select: { id: true, title: true },
      }),
      this.prisma.learningProgress.findMany({
        where: {
          userId,
          OR: [
            {
              contentType: LearningContentType.FLASHCARD,
              flashcard: { topic: { grade } },
            },
            {
              contentType: LearningContentType.SENTENCE,
              sentence: { sentenceImage: { topic: { grade } } },
            },
          ],
        },
        orderBy: { lastReviewedAt: 'desc' },
        select: {
          contentType: true,
          isMastered: true,
          reviewCount: true,
          flashcard: { select: { id: true, term: true, topicId: true } },
          sentence: {
            select: {
              id: true,
              text: true,
              sentenceImage: { select: { topicId: true } },
            },
          },
        },
      }),
      this.prisma.flashcard.findMany({
        where: { topic: { grade } },
        select: { id: true, topicId: true },
      }),
      this.prisma.sentence.findMany({
        where: { sentenceImage: { topic: { grade } } },
        select: { id: true, sentenceImage: { select: { topicId: true } } },
      }),
    ]);

    const topicTitle = new Map(topics.map((t) => [t.id, t.title]));
    const flashcardItems: GradeStatsItemDto[] = [];
    const sentenceItems: GradeStatsItemDto[] = [];
    const rowsPerTopic = new Map<number, number>();

    for (const p of progresses) {
      const isFlashcard = p.contentType === LearningContentType.FLASHCARD;
      const topicId = isFlashcard
        ? p.flashcard?.topicId
        : p.sentence?.sentenceImage.topicId;
      if (topicId === undefined) continue;

      rowsPerTopic.set(topicId, (rowsPerTopic.get(topicId) ?? 0) + 1);
      if (!p.isMastered) continue;

      const item = {
        id: isFlashcard ? p.flashcard!.id : p.sentence!.id,
        name: (isFlashcard ? p.flashcard!.term : p.sentence!.text) ?? '',
        reviewCount: p.reviewCount,
        topicName: topicTitle.get(topicId) ?? '',
        topicId,
      };
      (isFlashcard ? flashcardItems : sentenceItems).push(item);
    }

    flashcardItems.sort((a, b) => b.reviewCount - a.reviewCount);
    sentenceItems.sort((a, b) => b.reviewCount - a.reviewCount);

    const masteredFlashcards = new Set(flashcardItems.map((i) => i.id));
    const masteredSentences = new Set(sentenceItems.map((i) => i.id));
    const completedTopics = topics.filter((topic) => {
      const topicFlashcards = flashcards.filter((f) => f.topicId === topic.id);
      const topicSentences = sentences.filter(
        (s) => s.sentenceImage.topicId === topic.id,
      );
      return (
        topicFlashcards.length > 0 &&
        topicSentences.length > 0 &&
        topicFlashcards.every((f) => masteredFlashcards.has(f.id)) &&
        topicSentences.every((s) => masteredSentences.has(s.id))
      );
    });

    const contentStats = (
      items: GradeStatsItemDto[],
      total: number,
    ): GradeContentStatsDto => ({
      reviewed: items.length,
      total,
      percentage: total > 0 ? (items.length / total) * 100 : 0,
      topItems: items.slice(0, 5),
      allItems: items,
    });

    return {
      totalReviewed: flashcardItems.length + sentenceItems.length,
      flashcardStats: contentStats(flashcardItems, flashcards.length),
      sentenceStats: contentStats(sentenceItems, sentences.length),
      topicCount: completedTopics.length,
      topTopics: [...rowsPerTopic.entries()]
        .filter(([id]) => topicTitle.get(id))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, reviewCount]) => ({
          id,
          name: topicTitle.get(id)!,
          reviewCount,
        })),
      topics: topics.map((t) => ({ id: t.id, name: t.title })),
    };
  }

  private async computeTopicProgress(
    userId: number,
    topicWhere: Prisma.TopicWhereInput,
  ): Promise<TopicProgressResponseDto[]> {
    const [topics, flashcards, sentenceImages, progresses] = await Promise.all([
      this.prisma.topic.findMany({
        where: topicWhere,
        orderBy: [{ order: 'asc' }],
        select: { id: true },
      }),
      this.prisma.flashcard.findMany({
        where: { isActive: true, topic: topicWhere },
        orderBy: [{ topicId: 'asc' }, { order: 'asc' }],
        select: { id: true, topicId: true },
      }),
      this.prisma.sentenceImage.findMany({
        where: { isActive: true, topic: topicWhere },
        orderBy: [{ topicId: 'asc' }, { order: 'asc' }],
        select: {
          id: true,
          topicId: true,
          sentences: { where: { isActive: true }, select: { id: true } },
        },
      }),
      this.prisma.learningProgress.findMany({
        where: {
          userId,
          OR: [
            {
              contentType: LearningContentType.FLASHCARD,
              flashcard: { isActive: true, topic: topicWhere },
            },
            {
              contentType: LearningContentType.SENTENCE,
              sentence: {
                isActive: true,
                sentenceImage: { isActive: true, topic: topicWhere },
              },
            },
          ],
        },
        select: {
          contentType: true,
          isMastered: true,
          flashcardId: true,
          sentenceId: true,
        },
      }),
    ]);

    return topics.map((topic) =>
      buildTopicProgress(
        topic.id,
        flashcards.filter((f) => f.topicId === topic.id),
        sentenceImages.filter((si) => si.topicId === topic.id),
        progresses,
      ),
    );
  }

  async getReviewedFlashcardIds(
    userId: number,
    topicId: number,
  ): Promise<number[]> {
    const progressList = await this.prisma.learningProgress.findMany({
      where: {
        userId,
        contentType: LearningContentType.FLASHCARD,
        isMastered: true,
        flashcard: {
          topicId,
        },
      },
      select: {
        flashcardId: true,
      },
    });

    return progressList
      .map((p) => p.flashcardId)
      .filter((id): id is number => id !== null);
  }

  async getReviewedSentenceIds(
    userId: number,
    topicId: number,
  ): Promise<number[]> {
    const progressList = await this.prisma.learningProgress.findMany({
      where: {
        userId,
        contentType: LearningContentType.SENTENCE,
        isMastered: true,
        sentence: {
          sentenceImage: {
            topicId,
          },
        },
      },
      select: {
        sentenceId: true,
      },
    });

    return progressList
      .map((p) => p.sentenceId)
      .filter((id): id is number => id !== null);
  }

  async getLastReviewedTopic(userId: number): Promise<number | null> {
    const lastProgress = await this.prisma.learningProgress.findFirst({
      where: {
        userId,
      },
      include: {
        flashcard: {
          select: {
            topicId: true,
          },
        },
        sentence: {
          select: {
            sentenceImage: {
              select: {
                topicId: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastReviewedAt: 'desc',
      },
    });

    if (!lastProgress) {
      return null;
    }

    if (lastProgress.flashcard) {
      return lastProgress.flashcard.topicId;
    }

    if (lastProgress.sentence?.sentenceImage) {
      return lastProgress.sentence.sentenceImage.topicId;
    }

    return null;
  }
}

type ProgressRow = {
  contentType: LearningContentType;
  isMastered: boolean;
  flashcardId: number | null;
  sentenceId: number | null;
};

const toPercent = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 100 * 10) / 10 : 0;

function buildTopicProgress(
  topicId: number,
  flashcards: { id: number }[],
  sentenceImages: { id: number; sentences: { id: number }[] }[],
  progresses: ProgressRow[],
): TopicProgressResponseDto {
  const flashcardIndex = new Map(flashcards.map((f, i) => [f.id, i]));
  const sentenceImageIndex = new Map<number, number>();
  sentenceImages.forEach((si, i) =>
    si.sentences.forEach((s) => sentenceImageIndex.set(s.id, i)),
  );

  let reviewedFlashcards = 0;
  let reviewedSentences = 0;
  let maxFlashcardIndex = -1;
  let maxSentenceIndex = -1;

  for (const p of progresses) {
    if (p.contentType === LearningContentType.FLASHCARD && p.flashcardId) {
      const index = flashcardIndex.get(p.flashcardId);
      if (index === undefined) continue;
      if (p.isMastered) reviewedFlashcards++;
      maxFlashcardIndex = Math.max(maxFlashcardIndex, index);
    } else if (p.contentType === LearningContentType.SENTENCE && p.sentenceId) {
      const index = sentenceImageIndex.get(p.sentenceId);
      if (index === undefined) continue;
      if (p.isMastered) reviewedSentences++;
      maxSentenceIndex = Math.max(maxSentenceIndex, index);
    }
  }

  const totalFlashcards = flashcards.length;
  const totalSentences = sentenceImageIndex.size;

  return {
    topicId,
    totalFlashcards,
    reviewedFlashcards,
    flashcardProgress: toPercent(reviewedFlashcards, totalFlashcards),
    totalSentences,
    reviewedSentences,
    sentenceProgress: toPercent(reviewedSentences, totalSentences),
    lastReviewedFlashcardIndex:
      maxFlashcardIndex >= 0 ? maxFlashcardIndex : undefined,
    lastReviewedSentenceIndex:
      maxSentenceIndex >= 0 ? maxSentenceIndex : undefined,
  };
}
