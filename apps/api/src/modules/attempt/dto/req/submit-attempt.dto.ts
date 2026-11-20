import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmitExerciseDto } from './submit-exercise.dto';

/**
 * The final result of one exercise in a finished lesson.
 */
export class AttemptAnswerDto extends SubmitExerciseDto {
  @ApiPropertyOptional({
    description: 'Number of tries the learner used (1 or 2)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  attempts?: number;

  @ApiPropertyOptional({
    description: 'The learner skipped the exercise instead of answering it',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSkipped?: boolean;
}

/**
 * DTO for saving a finished lesson in one request: the attempt, every
 * answer, XP and streak are written together.
 */
export class SubmitAttemptDto {
  @ApiProperty({ description: 'Lesson ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  lessonId: number;

  @ApiPropertyOptional({
    description: 'Time spent on the whole lesson in seconds',
    example: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;

  @ApiProperty({
    description: 'One final result per exercise, in the order answered',
    type: [AttemptAnswerDto],
  })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => AttemptAnswerDto)
  answers: AttemptAnswerDto[];
}
