import { AttemptDetailResponseDto } from './attempt-detail-response.dto';

export class AttemptResponseDto {
  id: number;
  userId: number;
  lessonId: number;
  durationSec?: number;
  totalScore: number;
  maxScore: number;
  accuracyPct: number;
  correctCount: number;
  incorrectCount: number;
  skipCount: number;
  attemptNumber: number;
  isCompleted: boolean;
  details?: AttemptDetailResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedAttemptsResponseDto {
  data: AttemptResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
