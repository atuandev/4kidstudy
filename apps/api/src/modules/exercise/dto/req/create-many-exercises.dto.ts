import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExerciseDto } from './create-exercise.dto';

export class CreateManyExercisesDto {
  @ApiProperty({
    description: 'Array of exercises to create',
    type: [CreateExerciseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises: CreateExerciseDto[];
}
