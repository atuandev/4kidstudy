'use server';

import http from '@/lib/http';
import { 
  Attempt, 
  CreateAttemptRequest, 
  SubmitExerciseRequest, 
  CompleteAttemptRequest,
  AttemptDetail 
} from '@/types';

/**
 * Start a new lesson attempt
 */
export async function startAttempt(lessonId: number): Promise<Attempt> {
  const body: CreateAttemptRequest = { lessonId };
  const { payload } = await http.post<Attempt>('/attempts', JSON.stringify(body));
  return payload;
}

/**
 * Submit an exercise answer within an attempt
 */
export async function submitExercise(
  attemptId: number,
  data: SubmitExerciseRequest
): Promise<AttemptDetail> {
  const { payload } = await http.post<AttemptDetail>(
    `/attempts/${attemptId}/submit`,
    JSON.stringify(data)
  );
  return payload;
}

/**
 * Complete an attempt
 */
export async function completeAttempt(
  attemptId: number,
  data: CompleteAttemptRequest
): Promise<Attempt> {
  const { payload } = await http.patch<Attempt>(
    `/attempts/${attemptId}/complete`,
    JSON.stringify(data)
  );
  return payload;
}

/**
 * Get attempt by ID
 */
export async function getAttemptById(attemptId: number): Promise<Attempt> {
  const { payload } = await http.get<Attempt>(`/attempts/${attemptId}`);
  return payload;
}

/**
 * Get user's best attempt for a lesson
 */
export async function getBestAttempt(lessonId: number): Promise<Attempt | null> {
  const { payload } = await http.get<Attempt | null>(`/attempts/lesson/${lessonId}/best`);
  return payload;
}

/**
 * Get user's attempt history for a lesson
 */
export async function getUserLessonAttempts(lessonId: number): Promise<Attempt[]> {
  const { payload } = await http.get<Attempt[]>(`/attempts/lesson/${lessonId}/history`);
  return payload;
}

