import { Lesson } from "./lesson";

/**
 * Topic interface representing a learning topic
 */
export interface Topic {
  id: number;
  title: string;
  description?: string;
  grade?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  coverImage?: string;
  lessons: Lesson[];
  activeLessonPercentage?: number;
}
