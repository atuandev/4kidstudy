export class MostWrongExerciseStatsDto {
  exerciseId: number;
  exerciseOrder: number;
  exercisePrompt?: string;
  firstWrongCount: number;
  secondWrongCount: number;
  totalWrongCount: number;
}
