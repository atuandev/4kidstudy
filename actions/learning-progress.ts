'use server';

import http from '@/lib/http';
import {
  CreateLearningProgressFormData,
  ReviewContentFormData,
} from '@/schemas/learning-progress';
import { LearningProgress, LearningProgressStats, TopicProgress } from '@/types';

/**
 * Get or create learning progress for a user and content
 */
export async function createOrGetProgress(
  data: CreateLearningProgressFormData,
): Promise<LearningProgress> {
  const { payload } = await http.post<LearningProgress>(
    '/learning-progress',
    JSON.stringify(data),
  );
  return payload;
}

/**
 * Review content (increment review count)
 */
export async function reviewContent(
  data: ReviewContentFormData,
): Promise<LearningProgress> {
  const { payload } = await http.post<LearningProgress>(
    '/learning-progress/review',
    JSON.stringify(data),
  );
  return payload;
}

/**
 * Get user's learning progress statistics
 */
export async function getUserStats(): Promise<LearningProgressStats> {
  const { payload } = await http.get<LearningProgressStats>(
    '/learning-progress/stats',
  );
  return payload;
}

/**
 * Get learning progress by topic
 */
export async function getTopicProgress(
  topicId: number,
): Promise<TopicProgress> {
  const { payload } = await http.get<TopicProgress>(
    `/learning-progress/topic/${topicId}`,
  );
  return payload;
}

/**
 * Get reviewed flashcard IDs for a topic
 */
export async function getReviewedFlashcardIds(
  topicId: number,
): Promise<number[]> {
  const { payload } = await http.get<{ flashcardIds: number[] }>(
    `/learning-progress/topic/${topicId}/reviewed-flashcards`,
  );
  return payload.flashcardIds;
}

/**
 * Get last reviewed topic ID
 */
export async function getLastReviewedTopic(): Promise<number | null> {
  const { payload } = await http.get<{ topicId: number | null }>(
    '/learning-progress/last-topic',
  );
  return payload.topicId;
}
