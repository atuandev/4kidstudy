import { Topic } from "./topic";
import { LessonStatus } from "@4kidstudy/contracts";

export const LESSON_STATUS = LessonStatus;

export type { LessonStatus };

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
