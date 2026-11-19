import { Topic } from './topic';

/**
 * Lesson status values
 */
export const LESSON_STATUS = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const;

export type LessonStatus = typeof LESSON_STATUS[keyof typeof LESSON_STATUS];

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