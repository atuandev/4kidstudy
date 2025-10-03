import { Lesson } from "./lesson";
import { Flashcard } from "./flashcard";

/**
 * Topic interface representing a learning topic
 */
export interface Topic {
  id: number;
  title: string;
  description?: string;
  grade?: "GRADE_1" | "GRADE_2" | "GRADE_3" | "GRADE_4" | "GRADE_5";
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
  };
}
