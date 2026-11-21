import { IsInt, IsOptional } from 'class-validator';

export class CompleteAttemptDto {
  @IsOptional()
  @IsInt()
  durationSec?: number;
}
