import { IsBoolean, IsInt, IsOptional, IsDateString } from 'class-validator';

export class UpdateLearningProgressDto {
  @IsInt()
  @IsOptional()
  reviewCount?: number;

  @IsBoolean()
  @IsOptional()
  isMastered?: boolean;

  @IsDateString()
  @IsOptional()
  lastReviewedAt?: string;
}
