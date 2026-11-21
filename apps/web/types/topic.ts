import { Lesson } from "./lesson";
import type { GradeLevel } from "@4kidstudy/contracts";
import { Flashcard } from "./flashcard";

export interface Topic {
  id: number;
  title: string;
  description?: string;
  grade?: GradeLevel;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  coverImage?: string;
  lessons: Lesson[];
  flashcards: Flashcard[];
  _count: {
    lessons: number;
    flashcards: number;
    sentenceImages: number;
  };
}
