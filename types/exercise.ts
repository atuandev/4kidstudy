export type Exercise = {
  id: number;
  lessonId: number;
  type: string;
  order: number;
  prompt: string;
  imageUrl?: string;
  audioUrl?: string;
  targetText?: string;
  points: number;
  difficulty?: number;
  options: ExerciseOption[];
};

export type ExerciseOption = {
  id: number;
  exerciseId: number;
  text?: string;
  imageUrl?: string;
  audioUrl: string;
  isCorrect: boolean;
  order: number;
  matchKey?: string;
};