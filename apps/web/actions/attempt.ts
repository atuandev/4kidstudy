"use server";

import http from "@/lib/http";
import { Attempt, SubmitAttemptRequest, MostWrongExerciseStats } from "@/types";

/**
 * Save a finished lesson: the attempt, every answer, XP and streak in one request.
 */
export async function submitAttempt(data: SubmitAttemptRequest): Promise<Attempt> {
  const { payload } = await http.post<Attempt>("/attempts/submit", JSON.stringify(data));
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

/**
 * Get user's overall practice statistics
 */
export async function getPracticeStatistics() {
  const { payload } = await http.get<{
    completeLessonCount: number;
    totalLessonCount: number;
    totalDurationSec: number;
    totalCorrectCount: number;
    totalIncorrectCount: number;
    byType: Array<{
      type: string;
      correctCount: number;
      correctOnSecondCount: number;
      incorrectCount: number;
    }>;
  }>(`/attempts/statistics`);
  return payload;
}

/**
 * Get most wrong exercises for a lesson
 */
export async function getMostWrongExercisesByLesson(
  lessonId: number,
): Promise<MostWrongExerciseStats[]> {
  const { payload } = await http.get<MostWrongExerciseStats[]>(
    `/attempts/statistics/most-wrong-exercises?lessonId=${lessonId}`,
  );
  return payload;
}
