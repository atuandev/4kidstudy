import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying practice statistics day by day
 */
export class GetDailyPracticeStatsQueryDto {
  @ApiPropertyOptional({
    description: 'How many days back to include, today counted',
    minimum: 1,
    maximum: 365,
    default: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 7;
}
