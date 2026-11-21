import {
  Attempt,
  AttemptDetail,
  PronunciationScore,
  Exercise,
  ExerciseOption,
} from '@prisma/client';

export interface AttemptWithDetails extends Attempt {
  details?: AttemptDetailWithPronunciation[];
}

export interface ExerciseWithOptions extends Exercise {
  options: ExerciseOption[];
}

export interface AttemptDetailWithPronunciation extends AttemptDetail {
  pronunciation?: PronunciationScore | null;
  exercise?: ExerciseWithOptions;
}
