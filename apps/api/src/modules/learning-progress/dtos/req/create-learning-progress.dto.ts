import { IsInt, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { LearningContentType } from '@prisma/client';

export class CreateLearningProgressDto {
  @IsEnum(LearningContentType)
  @IsNotEmpty()
  contentType: LearningContentType;

  @IsInt()
  @IsOptional()
  flashcardId?: number;

  @IsInt()
  @IsOptional()
  sentenceId?: number;
}
