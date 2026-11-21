import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GradeLevel } from '@prisma/client';

export class GetPracticeStatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Only count lessons in this grade. Omit to count every grade.',
    enum: GradeLevel,
    example: GradeLevel.GRADE_1,
  })
  @IsOptional()
  @IsEnum(GradeLevel)
  grade?: GradeLevel;
}
