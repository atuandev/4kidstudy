import { Topic } from './topic';
import { LessonStatus } from '@4kidstudy/contracts';

/**
 * Lesson status values (from the Prisma schema via @4kidstudy/contracts)
 */
export const LESSON_STATUS = LessonStatus;

export type { LessonStatus };

/**
 * Lesson interface representing a learning lesson with all related data
 */
export interface Lesson {
  id: number;
  topicId: number;
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
  status: LessonStatus;
  theoryText: string;
  phoneticsNote: string;
  grammarNote: string;
  audioUrl: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  topic: Topic;
  _count: {
    exercises: number;
  };
}

/**
 * Lesson summary interface for list views (without nested relations)
 */
export interface LessonSummary {
  id: number;
  topicId: number;
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
  status: LessonStatus;
  coverImage: string;
  _count: {
    exercises: number;
  };
}