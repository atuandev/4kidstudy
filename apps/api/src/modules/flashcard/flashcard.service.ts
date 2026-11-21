import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateFlashcardDto,
  UpdateFlashcardDto,
  FlashcardBulkCreateDto,
} from './dtos/index';
import * as XLSX from 'xlsx';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class FlashcardService {
  constructor(private readonly prisma: PrismaService) {}

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (
        file.mimetype.startsWith('audio/') ||
        file.mimetype.startsWith('video/')
      ) {
        resourceType = 'video';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'flashcards',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            reject(
              new BadRequestException(
                `Cloudinary upload failed: ${error.message}`,
              ),
            );
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(
              new BadRequestException('Cloudinary upload failed: No result'),
            );
          }
        },
      );

      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  async create(createFlashcardDto: CreateFlashcardDto) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: createFlashcardDto.topicId },
    });

    if (!topic) {
      throw new NotFoundException(
        `Topic with ID ${createFlashcardDto.topicId} not found`,
      );
    }

    return this.prisma.flashcard.create({
      data: createFlashcardDto,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            grade: true,
          },
        },
      },
    });
  }

  async createBulk(flashcardBulkCreateDto: FlashcardBulkCreateDto) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: flashcardBulkCreateDto.topicId },
    });

    if (!topic) {
      throw new NotFoundException(
        `Topic with ID ${flashcardBulkCreateDto.topicId} not found`,
      );
    }

    if (
      !flashcardBulkCreateDto.flashcards ||
      flashcardBulkCreateDto.flashcards.length === 0
    ) {
      throw new BadRequestException('Flashcards array cannot be empty');
    }

    const maxOrderFlashcard = await this.prisma.flashcard.findFirst({
      where: { topicId: flashcardBulkCreateDto.topicId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const startOrder = maxOrderFlashcard ? maxOrderFlashcard.order + 1 : 0;

    let autoOrderCounter = startOrder;
    const flashcardsData = flashcardBulkCreateDto.flashcards.map(
      (flashcard) => {
        const orderValue =
          flashcard.order !== undefined && flashcard.order !== null
            ? flashcard.order
            : autoOrderCounter++;
        return {
          ...flashcard,
          topicId: flashcardBulkCreateDto.topicId,
          order: orderValue,
        };
      },
    );

    return this.prisma.$transaction(async (tx) => {
      const createdFlashcards = [];
      for (const flashcardData of flashcardsData) {
        const flashcard = await tx.flashcard.create({
          data: flashcardData,
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                grade: true,
              },
            },
          },
        });
        createdFlashcards.push(flashcard);
      }
      return createdFlashcards;
    });
  }

  async exportToExcel(): Promise<Buffer> {
    const flashcards = await this.prisma.flashcard.findMany({
      where: { isActive: true },
      orderBy: [{ topicId: 'asc' }, { order: 'asc' }],
      take: 20,
      include: {
        topic: {
          select: {
            title: true,
          },
        },
      },
    });

    const excelData = flashcards.map((fc) => ({
      term: fc.term,
      phonetic: fc.phonetic || '',
      meaningVi: fc.meaningVi,
      ExEn: fc.exampleEn || '',
      ExVi: fc.exampleVi || '',
      img: fc.imageUrl || '',
      audio: fc.audioUrl || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flashcards');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 30 },
      { wch: 50 },
      { wch: 50 },
    ];

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;
    return buffer;
  }

  async findAll(topicId?: number, isActive?: boolean, search?: string) {
    const where: Prisma.FlashcardWhereInput = {};

    if (topicId !== undefined) {
      where.topicId = topicId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { term: { contains: search, mode: 'insensitive' } },
        { meaningVi: { contains: search, mode: 'insensitive' } },
        { exampleEn: { contains: search, mode: 'insensitive' } },
        { exampleVi: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.flashcard.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            grade: true,
          },
        },
      },
      orderBy: [{ topicId: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findByTopic(topicId: number, isActive?: boolean) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    const where: Prisma.FlashcardWhereInput = { topicId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.flashcard.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            grade: true,
          },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: number) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            grade: true,
            description: true,
          },
        },
      },
    });

    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }

    return flashcard;
  }

  async checkProgress(flashcardIds: number[]) {
    const flashcards = await this.prisma.flashcard.findMany({
      where: {
        id: { in: flashcardIds },
      },
      select: {
        id: true,
        term: true,
        progress: {
          where: {
            contentType: 'FLASHCARD',
          },
          select: {
            id: true,
            isMastered: true,
          },
        },
      },
    });

    const flashcardsWithProgress = flashcards
      .filter((fc) => fc.progress.length > 0)
      .map((fc) => ({
        id: fc.id,
        term: fc.term,
        progressCount: fc.progress.length,
        hasMastered: fc.progress.some((p) => p.isMastered),
      }));

    return flashcardsWithProgress;
  }

  async update(id: number, updateFlashcardDto: UpdateFlashcardDto) {
    await this.findOne(id);

    if (updateFlashcardDto.topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: updateFlashcardDto.topicId },
      });

      if (!topic) {
        throw new NotFoundException(
          `Topic with ID ${updateFlashcardDto.topicId} not found`,
        );
      }
    }

    const { resetProgress, ...flashcardData } = updateFlashcardDto;

    if (resetProgress) {
      await this.prisma.learningProgress.deleteMany({
        where: {
          flashcardId: id,
          contentType: 'FLASHCARD',
        },
      });
    }

    return this.prisma.flashcard.update({
      where: { id },
      data: flashcardData,
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            grade: true,
          },
        },
      },
    });
  }

  async checkProgressForDelete(id: number) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        progress: {
          where: {
            contentType: 'FLASHCARD',
          },
        },
      },
    });

    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }

    return {
      id: flashcard.id,
      term: flashcard.term,
      hasProgress: flashcard.progress.length > 0,
      progressCount: flashcard.progress.length,
      masteredCount: flashcard.progress.filter((p) => p.isMastered).length,
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    const progressCount = await this.prisma.learningProgress.count({
      where: { flashcardId: id },
    });

    const hasProgress = progressCount > 0;

    if (hasProgress) {
      const updated = await this.prisma.flashcard.update({
        where: { id },
        data: { isActive: false },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              grade: true,
            },
          },
        },
      });
      return { flashcard: updated, hasProgress: true, deleted: false };
    } else {
      const deleted = await this.prisma.flashcard.delete({
        where: { id },
        include: {
          topic: {
            select: {
              id: true,
              title: true,
              grade: true,
            },
          },
        },
      });
      return { flashcard: deleted, hasProgress: false, deleted: true };
    }
  }

  async getFlashcardStats(topicId?: number) {
    const where: Prisma.FlashcardWhereInput = {};

    if (topicId !== undefined) {
      where.topicId = topicId;
    }

    const stats = await this.prisma.flashcard.groupBy({
      by: ['topicId', 'isActive'],
      where,
      _count: {
        id: true,
      },
    });

    const totalActive = stats
      .filter((stat) => stat.isActive)
      .reduce((sum, stat) => sum + stat._count.id, 0);

    const totalInactive = stats
      .filter((stat) => !stat.isActive)
      .reduce((sum, stat) => sum + stat._count.id, 0);

    return {
      totalFlashcards: totalActive + totalInactive,
      totalActive,
      totalInactive,
      byTopic: stats,
    };
  }

  async reorderFlashcards(topicId: number, flashcardIds: number[]) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    const flashcards = await this.prisma.flashcard.findMany({
      where: {
        id: { in: flashcardIds },
        topicId,
      },
    });

    if (flashcards.length !== flashcardIds.length) {
      throw new BadRequestException(
        'Some flashcard IDs are invalid or do not belong to this topic',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedFlashcards = [];
      for (let i = 0; i < flashcardIds.length; i++) {
        const updated = await tx.flashcard.update({
          where: { id: flashcardIds[i] },
          data: { order: i },
          include: {
            topic: {
              select: {
                id: true,
                title: true,
                grade: true,
              },
            },
          },
        });
        updatedFlashcards.push(updated);
      }
      return updatedFlashcards;
    });
  }

  async importFromExcel(
    topicId: number,
    buffer: Buffer,
    assetFiles: Express.Multer.File[] = [],
  ) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    try {
      const assetMap = new Map<string, string>();

      for (const file of assetFiles) {
        try {
          const uploadedUrl = await this.uploadToCloudinary(file);
          assetMap.set(file.originalname, uploadedUrl);
        } catch {}
      }

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('Excel file is empty');
      }

      const worksheet = workbook.Sheets[sheetName];

      interface ExcelRow {
        term?: string | number;
        meaningVi?: string | number;
        phonetic?: string | number;
        ExEn?: string | number;
        ExVi?: string | number;
        img?: string | number;
        audio?: string | number;
        [key: string]: unknown;
      }

      const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
        defval: '',
      });

      if (!data || data.length === 0) {
        throw new BadRequestException('No data found in Excel file');
      }

      const maxOrderFlashcard = await this.prisma.flashcard.findFirst({
        where: { topicId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const startOrder = maxOrderFlashcard ? maxOrderFlashcard.order + 1 : 0;

      const extractFileName = (path: string): string => {
        if (!path || typeof path !== 'string') return '';
        const normalized = path.trim();
        if (!normalized) return '';
        return normalized.split('\\').pop()?.split('/').pop() || '';
      };

      const normalizeValue = (value: unknown): string => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') {
          const s = value.trim();
          if (!s) return '';
          return s;
        }
        if (typeof value === 'object') return '';
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value).trim();
        }
        return '';
      };

      const mapAssetUrl = (cellValue: any): string => {
        if (!cellValue) return '';
        const path = normalizeValue(cellValue);
        if (!path) return '';

        if (path.startsWith('http://') || path.startsWith('https://')) {
          return path;
        }

        const fileName = extractFileName(path);
        if (!fileName) return '';

        const uploadedUrl = assetMap.get(fileName);
        if (uploadedUrl) {
          return uploadedUrl;
        }
        return '';
      };

      const flashcards: CreateFlashcardDto[] = data.map((row, index) => {
        const term = normalizeValue(row.term);
        const meaningVi = normalizeValue(row.meaningVi);

        if (!term || !meaningVi) {
          throw new BadRequestException(
            `Row ${index + 2}: term and meaningVi are required`,
          );
        }

        return {
          topicId,
          term,
          phonetic: normalizeValue(row.phonetic),
          meaningVi,
          exampleEn: normalizeValue(row.ExEn),
          exampleVi: normalizeValue(row.ExVi),
          imageUrl: mapAssetUrl(row.img),
          audioUrl: mapAssetUrl(row.audio),
          order: startOrder + index,
          isActive: true,
        };
      });

      const createdFlashcards = await this.prisma.$transaction(
        async (tx) => {
          const createdFlashcards = [];
          for (const flashcard of flashcards) {
            const created = await tx.flashcard.create({
              data: flashcard,
              include: {
                topic: {
                  select: {
                    id: true,
                    title: true,
                    grade: true,
                  },
                },
              },
            });
            createdFlashcards.push(created);
          }
          return createdFlashcards;
        },
        {
          maxWait: 15000,
          timeout: 15000,
        },
      );

      return {
        imported: createdFlashcards.length,
        flashcards: createdFlashcards.map((fc) => ({
          id: fc.id,
          term: fc.term,
          order: fc.order,
        })),
      };
    } catch (error: unknown) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to parse Excel file: ${msg}`);
    }
  }
}
