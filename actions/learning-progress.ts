'use server';

import http from '@/lib/http';
import {
  CreateLearningProgressFormData,
  ReviewContentFormData,
} from '@/schemas/learning-progress';
import { LearningProgress, LearningProgressStats } from '@/types';

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

  console.log('[reviewContent] Called with data:', data);
  try {
    const { payload } = await http.post<LearningProgress>(
      '/learning-progress/review',
      JSON.stringify(data),
    );
    console.log('[reviewContent] Response payload:', payload);
    return payload;
  } catch (err) {
    // If review fails because progress doesn't exist yet, create it then retry
    console.warn('[reviewContent] initial review failed, attempting to create progress and retry', err);
    try {
      await createOrGetProgress({
        contentType: data.contentType,
        flashcardId: data.flashcardId,
        sentenceId: data.sentenceId,
      });
      const { payload } = await http.post<LearningProgress>(
        '/learning-progress/review',
        JSON.stringify(data),
      );
      console.log('[reviewContent] Response payload after create:', payload);
      return payload;
    } catch (err2) {
      console.error('[reviewContent] retry failed', err2);
      throw err2;
    }
  }
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
