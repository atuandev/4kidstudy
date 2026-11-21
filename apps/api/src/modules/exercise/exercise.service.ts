import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExerciseDto,
  CreateManyExercisesDto,
  CreateOptionDto,
  UpdateExerciseDto,
  UpdateOptionDto,
  ImportCsvResponseDto,
} from './dto/index';
import { ExerciseType } from '@prisma/client';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CsvRow {
  [key: string]: string;
}

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

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
          folder: 'exercises',
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

  async findAll(lessonId?: number, type?: ExerciseType) {
    const where: {
      lessonId?: number;
      type?: ExerciseType;
    } = {};

    if (lessonId) {
      where.lessonId = lessonId;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.exercise.findMany({
      where,
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    return exercise;
  }

  async getExerciseOptions(exerciseId: number) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    return this.prisma.exerciseOption.findMany({
      where: { exerciseId },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async create(createExerciseDto: CreateExerciseDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createExerciseDto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson with ID ${createExerciseDto.lessonId} not found`,
      );
    }

    const lastExercise = await this.prisma.exercise.findFirst({
      where: { lessonId: createExerciseDto.lessonId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastExercise ? lastExercise.order + 1 : 0;

    const { options, ...exerciseData } = createExerciseDto;

    return this.prisma.$transaction(async (tx) => {
      const exercise = await tx.exercise.create({
        data: {
          ...exerciseData,
          order: createExerciseDto.order ?? newOrder,
        },
      });

      if (options && options.length > 0) {
        await Promise.all(
          options.map((option, index) =>
            tx.exerciseOption.create({
              data: {
                exerciseId: exercise.id,
                text: option.text,
                imageUrl: option.imageUrl,
                audioUrl: option.audioUrl,
                isCorrect: option.isCorrect,
                matchKey: option.matchKey,
                order: option.order ?? index,
              },
            }),
          ),
        );
      }

      return tx.exercise.findUnique({
        where: { id: exercise.id },
        include: {
          options: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
  }

  async createMany(createManyDto: CreateManyExercisesDto) {
    const exercises: CreateExerciseDto[] = createManyDto.exercises;

    if (!exercises || exercises.length === 0) {
      throw new BadRequestException('No exercises provided');
    }

    const lessonIds = [
      ...new Set(exercises.map((exercise) => exercise.lessonId)),
    ];
    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: lessonIds } },
    });

    if (lessons.length !== lessonIds.length) {
      const foundIds = new Set(lessons.map((lesson) => lesson.id));
      const missingIds = lessonIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Lessons with IDs ${missingIds.join(', ')} not found`,
      );
    }

    const exercisesByLesson: Record<number, CreateExerciseDto[]> = {};
    for (const exercise of exercises) {
      if (!exercisesByLesson[exercise.lessonId]) {
        exercisesByLesson[exercise.lessonId] = [];
      }
      exercisesByLesson[exercise.lessonId].push(exercise);
    }

    const maxOrdersByLesson: Record<number, number> = {};
    for (const lessonId of lessonIds) {
      const lastExercise = await this.prisma.exercise.findFirst({
        where: { lessonId },
        orderBy: { order: 'desc' },
      });
      maxOrdersByLesson[lessonId] = lastExercise ? lastExercise.order + 1 : 0;
    }

    return this.prisma.$transaction(async (tx) => {
      const createdExercises = [];

      for (const lessonId of lessonIds) {
        const lessonExercises = exercisesByLesson[lessonId];
        let currentOrder = maxOrdersByLesson[lessonId];

        for (const exerciseDto of lessonExercises) {
          const { options, ...exerciseData } = exerciseDto;

          const exercise = await tx.exercise.create({
            data: {
              ...exerciseData,
              order: exerciseDto.order ?? currentOrder++,
            },
          });

          if (options && options.length > 0) {
            await Promise.all(
              options.map((option, index) =>
                tx.exerciseOption.create({
                  data: {
                    exerciseId: exercise.id,
                    text: option.text,
                    imageUrl: option.imageUrl,
                    audioUrl: option.audioUrl,
                    isCorrect: option.isCorrect,
                    matchKey: option.matchKey,
                    order: option.order ?? index,
                  },
                }),
              ),
            );
          }

          const createdExercise = await tx.exercise.findUnique({
            where: { id: exercise.id },
            include: {
              options: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
          });

          if (createdExercise) {
            createdExercises.push(createdExercise);
          }
        }
      }

      return createdExercises;
    });
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto) {
    await this.findOne(id);

    const { options, ...exerciseData } = updateExerciseDto;

    if (exerciseData.lessonId) {
      const lessonExists = await this.prisma.lesson.findUnique({
        where: { id: exerciseData.lessonId },
      });

      if (!lessonExists) {
        throw new NotFoundException(
          `Lesson with ID ${exerciseData.lessonId} not found`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.exercise.update({
        where: { id },
        data: exerciseData,
      });

      if (options && options.length > 0) {
        for (const option of options) {
          if (option.id) {
            await tx.exerciseOption.update({
              where: { id: option.id },
              data: {
                text: option.text,
                imageUrl: option.imageUrl,
                audioUrl: option.audioUrl,
                isCorrect: option.isCorrect,
                matchKey: option.matchKey,
                order: option.order,
              },
            });
          } else {
            if (option.order !== undefined) {
              const existingOption = await tx.exerciseOption.findFirst({
                where: {
                  exerciseId: id,
                  order: option.order,
                },
              });

              if (existingOption) {
                throw new BadRequestException(
                  `An option with order ${option.order} already exists in this exercise`,
                );
              }
            } else {
              const lastOption = await tx.exerciseOption.findFirst({
                where: { exerciseId: id },
                orderBy: { order: 'desc' },
              });
              option.order = lastOption ? lastOption.order + 1 : 0;
            }

            await tx.exerciseOption.create({
              data: {
                exerciseId: id,
                text: option.text,
                imageUrl: option.imageUrl,
                audioUrl: option.audioUrl,
                isCorrect: option.isCorrect,
                matchKey: option.matchKey,
                order: option.order,
              },
            });
          }
        }
      }

      return tx.exercise.findUnique({
        where: { id },
        include: {
          options: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });
  }

  async delete(id: number) {
    await this.findOne(id);

    return this.prisma.exercise.delete({
      where: { id },
    });
  }

  async createOption(exerciseId: number, createOptionDto: CreateOptionDto) {
    await this.findOne(exerciseId);

    if (createOptionDto.order !== undefined) {
      const existingOption = await this.prisma.exerciseOption.findFirst({
        where: {
          exerciseId,
          order: createOptionDto.order,
        },
      });

      if (existingOption) {
        throw new BadRequestException(
          `An option with order ${createOptionDto.order} already exists in this exercise`,
        );
      }
    } else {
      const lastOption = await this.prisma.exerciseOption.findFirst({
        where: { exerciseId },
        orderBy: { order: 'desc' },
      });

      createOptionDto.order = lastOption ? lastOption.order + 1 : 0;
    }

    return this.prisma.exerciseOption.create({
      data: {
        exerciseId,
        text: createOptionDto.text,
        imageUrl: createOptionDto.imageUrl,
        audioUrl: createOptionDto.audioUrl,
        isCorrect: createOptionDto.isCorrect,
        matchKey: createOptionDto.matchKey,
        order: createOptionDto.order,
      },
    });
  }

  async updateOption(id: number, updateOptionDto: UpdateOptionDto) {
    const option = await this.prisma.exerciseOption.findUnique({
      where: { id },
    });

    if (!option) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }

    if (
      updateOptionDto.order !== undefined &&
      updateOptionDto.order !== option.order
    ) {
      const existingOption = await this.prisma.exerciseOption.findFirst({
        where: {
          exerciseId: option.exerciseId,
          order: updateOptionDto.order,
          id: { not: id },
        },
      });

      if (existingOption) {
        throw new BadRequestException(
          `Another option with order ${updateOptionDto.order} already exists in this exercise`,
        );
      }
    }

    return this.prisma.exerciseOption.update({
      where: { id },
      data: updateOptionDto,
    });
  }

  async deleteOption(id: number) {
    const option = await this.prisma.exerciseOption.findUnique({
      where: { id },
    });

    if (!option) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }

    return this.prisma.exerciseOption.delete({
      where: { id },
    });
  }

  async reorderExercises(lessonId: number, exerciseIds: number[]) {
    const exercises = await this.prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds },
        lessonId,
      },
    });

    if (exercises.length !== exerciseIds.length) {
      throw new BadRequestException(
        'Some exercises do not exist or do not belong to the specified lesson',
      );
    }

    await Promise.all(
      exerciseIds.map((id, index) =>
        this.prisma.exercise.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.exercise.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async reorderOptions(exerciseId: number, optionIds: number[]) {
    const options = await this.prisma.exerciseOption.findMany({
      where: {
        id: { in: optionIds },
        exerciseId,
      },
    });

    if (options.length !== optionIds.length) {
      throw new BadRequestException(
        'Some options do not exist or do not belong to the specified exercise',
      );
    }

    await Promise.all(
      optionIds.map((id, index) =>
        this.prisma.exerciseOption.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.exerciseOption.findMany({
      where: { exerciseId },
      orderBy: { order: 'asc' },
    });
  }

  async importFromCsv(
    lessonId: number,
    exercisesFile?: Express.Multer.File,
    optionsFile?: Express.Multer.File,
  ): Promise<ImportCsvResponseDto> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const response: ImportCsvResponseDto = {
      success: true,
      exercises: { created: 0, skipped: 0, failed: 0, errors: [] },
      options: { created: 0, skipped: 0, failed: 0, errors: [] },
    };

    const exerciseIdMap = new Map<number, number>();

    if (exercisesFile) {
      const { stats, idMap } = await this.importExercises(
        lessonId,
        exercisesFile.buffer,
      );
      response.exercises = stats;
      idMap.forEach((dbId, csvId) => {
        exerciseIdMap.set(csvId, dbId);
      });
    }

    if (optionsFile) {
      const optionsResult = await this.importOptions(
        optionsFile.buffer,
        exerciseIdMap,
      );
      response.options = optionsResult;
    }

    response.success =
      response.exercises.failed === 0 && response.options.failed === 0;

    response.message = `Import completed. Exercises: ${response.exercises.created} created, ${response.exercises.skipped} skipped, ${response.exercises.failed} failed. Options: ${response.options.created} created, ${response.options.skipped} skipped, ${response.options.failed} failed.`;

    return response;
  }

  private async parseCsv(buffer: Buffer): Promise<CsvRow[]> {
    return new Promise((resolve, reject) => {
      const results: CsvRow[] = [];
      let content = buffer.toString('utf8');
      if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
      }
      const stream = Readable.from(content);

      stream
        .pipe(csvParser())
        .on('data', (data: CsvRow) => {
          const trimmedData: CsvRow = {};
          for (const key in data) {
            const trimmedKey = key.trim();
            trimmedData[trimmedKey] =
              typeof data[key] === 'string' ? data[key].trim() : data[key];
          }
          results.push(trimmedData);
        })
        .on('end', () => resolve(results))
        .on('error', (error: Error) => reject(error));
    });
  }

  private async importExercises(lessonId: number, buffer: Buffer) {
    const stats = { created: 0, skipped: 0, failed: 0, errors: [] as string[] };
    const idMap = new Map<number, number>();

    try {
      const exercises = await this.parseCsv(buffer);

      for (const row of exercises) {
        try {
          const order = parseInt(row.order || '0');
          const csvId = parseInt(row.id || '0');

          const existing = await this.prisma.exercise.findFirst({
            where: {
              lessonId,
              order,
            },
          });

          if (existing) {
            stats.skipped++;
            stats.errors?.push(
              `Exercise with order ${order} already exists in lesson ${lessonId}`,
            );
            if (csvId) {
              idMap.set(csvId, existing.id);
            }
            continue;
          }

          const type = row.type as ExerciseType;

          if (!type) {
            stats.failed++;
            stats.errors?.push(
              `Exercise at order ${order} is missing required field 'type'`,
            );
            continue;
          }

          const validTypes = Object.values(ExerciseType);
          if (!validTypes.includes(type)) {
            stats.failed++;
            stats.errors?.push(
              `Exercise at order ${order} has invalid type '${row.type}'. Valid types: ${validTypes.join(', ')}`,
            );
            continue;
          }

          const createdExercise = await this.prisma.exercise.create({
            data: {
              lessonId,
              type,
              order,
              prompt: row.prompt === '\\N' || !row.prompt ? null : row.prompt,
              imageUrl:
                row.imageUrl === '\\N' || !row.imageUrl ? null : row.imageUrl,
              audioUrl:
                row.audioUrl === '\\N' || !row.audioUrl ? null : row.audioUrl,
              targetText:
                row.targetText === '\\N' || !row.targetText
                  ? null
                  : row.targetText,
              hintEn: row.hintEn === '\\N' || !row.hintEn ? null : row.hintEn,
              hintVi: row.hintVi === '\\N' || !row.hintVi ? null : row.hintVi,
              points: row.points ? parseInt(row.points) : 10,
              difficulty: row.difficulty ? parseInt(row.difficulty) : 1,
            },
          });

          stats.created++;

          if (csvId) {
            idMap.set(csvId, createdExercise.id);
          }
        } catch (error: any) {
          stats.failed++;
          stats.errors?.push(
            `Failed to import exercise at order ${row.order}: ${error.message}`,
          );
        }
      }
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to parse exercises CSV: ${error.message}`,
      );
    }

    return { stats, idMap };
  }

  private async importOptions(
    buffer: Buffer,
    exerciseIdMap: Map<number, number>,
  ) {
    const stats = { created: 0, skipped: 0, failed: 0, errors: [] as string[] };

    try {
      const options = await this.parseCsv(buffer);

      for (const row of options) {
        try {
          const csvExerciseId = parseInt(row.exerciseId || '0');
          const order = parseInt(row.order || '0');

          const dbExerciseId = exerciseIdMap.get(csvExerciseId);

          if (!dbExerciseId) {
            stats.failed++;
            stats.errors?.push(
              `Exercise with CSV ID ${csvExerciseId} not found in imported exercises. Option at order ${order} skipped.`,
            );
            continue;
          }

          const exercise = await this.prisma.exercise.findUnique({
            where: { id: dbExerciseId },
          });

          if (!exercise) {
            stats.failed++;
            stats.errors?.push(
              `Exercise with DB ID ${dbExerciseId} (CSV ID: ${csvExerciseId}) not found for option at order ${order}`,
            );
            continue;
          }

          const existing = await this.prisma.exerciseOption.findFirst({
            where: {
              exerciseId: dbExerciseId,
              order,
            },
          });

          if (existing) {
            stats.skipped++;
            stats.errors?.push(
              `Option with order ${order} already exists for exercise ${dbExerciseId} (CSV ID: ${csvExerciseId})`,
            );
            continue;
          }

          const optionData = {
            exerciseId: dbExerciseId,
            text: row.text === '\\N' || !row.text ? null : row.text,
            imageUrl:
              row.imageUrl === '\\N' || !row.imageUrl ? null : row.imageUrl,
            audioUrl:
              row.audioUrl === '\\N' || !row.audioUrl ? null : row.audioUrl,
            isCorrect: row.isCorrect === 'TRUE' || row.isCorrect === 'true',
            order,
            matchKey:
              row.matchKey === '\\N' || !row.matchKey ? null : row.matchKey,
          };

          await this.prisma.exerciseOption.create({
            data: optionData,
          });

          stats.created++;
        } catch (error: any) {
          stats.failed++;
          stats.errors?.push(
            `Failed to import option for exercise ${row.exerciseId} at order ${row.order}: ${error.message}`,
          );
        }
      }
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to parse options CSV: ${error.message}`,
      );
    }

    return stats;
  }

  async importFromExcel(
    lessonId: number,
    buffer: Buffer,
    assetFiles: Express.Multer.File[] = [],
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    try {
      const assetMap = new Map<string, string>();

      for (const file of assetFiles) {
        try {
          const uploadedUrl = await this.uploadToCloudinary(file);
          assetMap.set(file.originalname, uploadedUrl);
        } catch (error) {
          console.error(`❌ Failed to upload ${file.originalname}:`, error);
        }
      }

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new BadRequestException('Excel file is empty');
      }

      const worksheet = workbook.Sheets[sheetName];

      interface ExcelRow {
        Type?: string;
        type?: string;
        img?: string | number;
        audio?: string | number;
        prompt?: string | number;
        targetText?: string | number;
        hintVi?: string | number;
        hintEn?: string | number;
        optT?: string | number;
        optF?: string | number;
        optF1?: string | number;
        optF2?: string | number;
        optF3?: string | number;
        opt1?: string | number;
        opt2?: string | number;
        opt3?: string | number;
        opt4?: string | number;
        opt5?: string | number;
        opt6?: string | number;
        [key: string]: unknown;
      }

      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      });

      if (!rawData || rawData.length < 2) {
        throw new BadRequestException('No data found in Excel file');
      }

      const headerRow = rawData[0] as string[];

      const columnCounts = new Map<string, number>();
      const renamedHeaders = headerRow.map((col) => {
        const colStr = String(col || '').trim();
        if (!colStr) return colStr;

        if (colStr === 'optF') {
          const count = columnCounts.get(colStr) || 0;
          columnCounts.set(colStr, count + 1);
          return `optF${count + 1}`;
        }

        return colStr;
      });

      const data: ExcelRow[] = [];
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i] as unknown[];
        const obj: ExcelRow = {};
        renamedHeaders.forEach((header, index) => {
          if (header) {
            obj[header] = row[index];
          }
        });
        data.push(obj);
      }

      if (!data || data.length === 0) {
        throw new BadRequestException('No data found in Excel file');
      }

      const maxOrderExercise = await this.prisma.exercise.findFirst({
        where: { lessonId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const startOrder = maxOrderExercise ? maxOrderExercise.order + 1 : 0;

      const extractFileName = (path: string): string => {
        if (!path || typeof path !== 'string') return '';
        const normalized = path.trim();
        if (normalized === '\\n' || normalized === '\n') return '';
        return normalized.split('\\').pop()?.split('/').pop() || '';
      };

      const normalizeValue = (value: unknown): string => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') {
          const s = value.trim();
          if (s === '\\n' || s === '\n') return '';
          return s;
        }
        if (typeof value === 'object') return '';
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value).trim();
        }
        return '';
      };

      const mapAssetUrl = (cellValue: unknown): string => {
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

      const createdExercises = await this.prisma.$transaction(
        async (tx) => {
          const exercises = [];

          for (let index = 0; index < data.length; index++) {
            const row = data[index];
            const type = normalizeValue(row.Type || row.type) as ExerciseType;

            if (!type) {
              throw new BadRequestException(
                `Row ${index + 2}: Type is required`,
              );
            }

            const validTypes = Object.values(ExerciseType);
            if (!validTypes.includes(type)) {
              throw new BadRequestException(
                `Row ${index + 2}: Invalid type '${type}'. Valid types: ${validTypes.join(', ')}`,
              );
            }

            const exercise = await tx.exercise.create({
              data: {
                lessonId,
                type,
                order: startOrder + index,
                prompt: normalizeValue(row.prompt) || null,
                imageUrl: mapAssetUrl(row.img) || null,
                audioUrl: mapAssetUrl(row.audio) || null,
                targetText: normalizeValue(row.targetText) || null,
                hintVi: normalizeValue(row.hintVi) || null,
                hintEn: normalizeValue(row.hintEn) || null,
                points: 10,
                difficulty: 1,
              },
            });

            if (type === 'SELECT_IMAGE') {
              const correctImgPath = row.optT || row.optt || row.OPTT;
              const incorrectImg1 = row.optF1 || row.optf1 || row.OPTF1;
              const incorrectImg2 = row.optF2 || row.optf2 || row.OPTF2;
              const incorrectImg3 = row.optF3 || row.optf3 || row.OPTF3;

              const correctImg = mapAssetUrl(correctImgPath);
              const incorrectImgs = [
                { url: mapAssetUrl(incorrectImg1), order: 1 },
                { url: mapAssetUrl(incorrectImg2), order: 2 },
                { url: mapAssetUrl(incorrectImg3), order: 3 },
              ];

              if (correctImg) {
                await tx.exerciseOption.create({
                  data: {
                    exerciseId: exercise.id,
                    imageUrl: correctImg,
                    isCorrect: true,
                    order: 0,
                  },
                });
              }

              for (const incorrectOpt of incorrectImgs) {
                if (incorrectOpt.url) {
                  await tx.exerciseOption.create({
                    data: {
                      exerciseId: exercise.id,
                      imageUrl: incorrectOpt.url,
                      isCorrect: false,
                      order: incorrectOpt.order,
                    },
                  });
                }
              }
            } else if (type === 'MULTIPLE_CHOICE' || type === 'LISTENING') {
              const correctTextRaw = row.optT || row.optt || row.OPTT;
              const incorrectText1 = row.optF1 || row.optf1 || row.OPTF1;
              const incorrectText2 = row.optF2 || row.optf2 || row.OPTF2;
              const incorrectText3 = row.optF3 || row.optf3 || row.OPTF3;

              const correctText = normalizeValue(correctTextRaw);
              const incorrectTexts = [
                { text: normalizeValue(incorrectText1), order: 1 },
                { text: normalizeValue(incorrectText2), order: 2 },
                { text: normalizeValue(incorrectText3), order: 3 },
              ];

              if (correctText) {
                await tx.exerciseOption.create({
                  data: {
                    exerciseId: exercise.id,
                    text: correctText,
                    isCorrect: true,
                    order: 0,
                  },
                });
              }

              for (const incorrectOpt of incorrectTexts) {
                if (incorrectOpt.text) {
                  await tx.exerciseOption.create({
                    data: {
                      exerciseId: exercise.id,
                      text: incorrectOpt.text,
                      isCorrect: false,
                      order: incorrectOpt.order,
                    },
                  });
                }
              }
            } else if (type === 'MATCHING') {
              const optTVal = normalizeValue(row.optT);
              const optF1Val = normalizeValue(row.optF1);
              const optF2Val = normalizeValue(row.optF2);
              const optF3Val = normalizeValue(row.optF3);

              const allOpts = [optTVal, optF1Val, optF2Val, optF3Val];

              const pairs = allOpts.filter(
                (pair) => pair && pair.includes('|'),
              );

              let optionOrder = 0;
              for (let i = 0; i < pairs.length; i++) {
                const [left, right] = pairs[i].split('|').map((s) => s.trim());
                const matchKey = `pair_${i + 1}`;

                const isImagePath = (val: string): boolean => {
                  return (
                    val.match(/\.(jpg|jpeg|png|gif|webp|mp3|mp4)$/i) !== null ||
                    val.includes('g1-') ||
                    val.includes('/')
                  );
                };

                const leftIsImage = isImagePath(left);
                const rightIsImage = isImagePath(right);

                await tx.exerciseOption.create({
                  data: {
                    exerciseId: exercise.id,
                    text: leftIsImage ? null : left,
                    imageUrl: leftIsImage ? mapAssetUrl(left) || null : null,
                    matchKey,
                    isCorrect: false,
                    order: optionOrder++,
                  },
                });

                await tx.exerciseOption.create({
                  data: {
                    exerciseId: exercise.id,
                    text: rightIsImage ? null : right,
                    imageUrl: rightIsImage ? mapAssetUrl(right) || null : null,
                    matchKey,
                    isCorrect: false,
                    order: optionOrder++,
                  },
                });
              }
            }

            exercises.push(exercise);
          }

          return exercises;
        },
        {
          maxWait: 15000,
          timeout: 15000,
        },
      );

      return {
        imported: createdExercises.length,
        exercises: createdExercises.map((ex) => ({
          id: ex.id,
          type: ex.type,
          order: ex.order,
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

  async exportToExcel(lessonId?: number): Promise<Buffer> {
    const where: any = {};
    if (lessonId) {
      where.lessonId = lessonId;
    }

    const exercises = await this.prisma.exercise.findMany({
      where,
      orderBy: [{ lessonId: 'asc' }, { order: 'asc' }],
      take: 20,
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
        lesson: {
          select: {
            title: true,
          },
        },
      },
    });

    const excelData = exercises.map((exercise) => {
      const row: Record<string, string> = {
        type: exercise.type,
        prompt: exercise.prompt || '',
        img: exercise.imageUrl || '',
        audio: exercise.audioUrl || '',
        targetText: exercise.targetText || '',
        hintVi: exercise.hintVi || '',
        hintEn: exercise.hintEn || '',
      };

      const correctOption = exercise.options.find((opt) => opt.isCorrect);
      const incorrectOptions = exercise.options.filter((opt) => !opt.isCorrect);

      if (exercise.type === 'SELECT_IMAGE') {
        row.optT = correctOption?.imageUrl || '';
        const incorrects = incorrectOptions.slice(0, 3);
        row.optF1 = incorrects[0]?.imageUrl || '';
        row.optF2 = incorrects[1]?.imageUrl || '';
        row.optF3 = incorrects[2]?.imageUrl || '';
      } else if (
        exercise.type === 'MULTIPLE_CHOICE' ||
        exercise.type === 'LISTENING'
      ) {
        row.optT = correctOption?.text || '';
        const incorrects = incorrectOptions.slice(0, 3);
        row.optF1 = incorrects[0]?.text || '';
        row.optF2 = incorrects[1]?.text || '';
        row.optF3 = incorrects[2]?.text || '';
      } else if (exercise.type === 'MATCHING') {
        const matchGroups = new Map<string, any[]>();
        exercise.options.forEach((opt) => {
          if (opt.matchKey) {
            if (!matchGroups.has(opt.matchKey)) {
              matchGroups.set(opt.matchKey, []);
            }
            matchGroups.get(opt.matchKey)!.push(opt);
          }
        });

        const pairs: string[] = [];
        matchGroups.forEach((group) => {
          if (group.length >= 2) {
            const left = group[0].text || group[0].imageUrl || '';
            const right = group[1].text || group[1].imageUrl || '';
            pairs.push(`${left}|${right}`);
          }
        });

        row.optT = pairs[0] || '';
        row.optF1 = pairs[1] || '';
        row.optF2 = pairs[2] || '';
        row.optF3 = pairs[3] || '';
      } else if (exercise.type === 'PRONUNCIATION') {
        row.optT = '';
        row.optF1 = '';
        row.optF2 = '';
        row.optF3 = '';
      }

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exercises');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 50 },
      { wch: 50 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
      { wch: 40 },
    ];

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as Buffer;
    return buffer;
  }
}
