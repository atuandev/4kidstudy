import type { ExerciseType } from "@4kidstudy/contracts";

export type { ExerciseType };

export type Exercise = {
  id: number;
  lessonId: number;
  type: ExerciseType;
  order: number;
  prompt: string;
  imageUrl?: string;
  audioUrl?: string;
  targetText?: string;
  hintEn?: string;
  hintVi?: string;
  points: number;
  difficulty?: number;
  options: ExerciseOption[];
  createdAt: string;
  updatedAt: string;
};

export type ExerciseOption = {
  id: number;
  exerciseId: number;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  isCorrect: boolean;
  order: number;
  matchKey?: string;
};
