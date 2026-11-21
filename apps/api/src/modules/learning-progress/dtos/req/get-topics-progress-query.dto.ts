import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GradeLevel } from '@prisma/client';

export class GetTopicsProgressQueryDto {
  @ApiProperty({
    description: 'Grade whose topics to return progress for',
    enum: GradeLevel,
    example: GradeLevel.GRADE_1,
  })
  @IsEnum(GradeLevel)
  grade: GradeLevel;
}
