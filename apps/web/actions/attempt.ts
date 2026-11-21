"use server";

import http from "@/lib/http";
import {
  Attempt,
  DailyPracticeStats,
  MostWrongExerciseStats,
  PracticeStatistics,
  SubmitAttemptRequest,
} from "@/types";
import { GradeValue } from "@/types/grade";

export async function submitAttempt(data: SubmitAttemptRequest): Promise<Attempt> {
  const { payload } = await http.post<Attempt>("/attempts/submit", JSON.stringify(data));
  return payload;
}

export async function getAttemptById(attemptId: number): Promise<Attempt> {
  const { payload } = await http.get<Attempt>(`/attempts/${attemptId}`);
  return payload;
}

export async function getBestAttempt(lessonId: number): Promise<Attempt | null> {
  const { payload } = await http.get<Attempt | null>(`/attempts/lesson/${lessonId}/best`);
  return payload;
}

export async function getUserLessonAttempts(lessonId: number): Promise<Attempt[]> {
  const { payload } = await http.get<Attempt[]>(`/attempts/lesson/${lessonId}/history`);
  return payload;
}

export async function getPracticeStatistics(grade: GradeValue): Promise<PracticeStatistics> {
  const { payload } = await http.get<PracticeStatistics>(`/attempts/statistics?grade=${grade}`);
  return payload;
}

export async function getDailyPracticeStats(days: number = 7): Promise<DailyPracticeStats> {
  try {
    const { payload } = await http.get<DailyPracticeStats>(
      `/attempts/statistics/daily?days=${days}`,
    );
    return payload;
  } catch (error) {
    console.error("Error fetching daily practice stats:", error);
    return { days, data: [] };
  }
}

export async function getMostWrongExercisesByLesson(
  lessonId: number,
): Promise<MostWrongExerciseStats[]> {
  const { payload } = await http.get<MostWrongExerciseStats[]>(
    `/attempts/statistics/most-wrong-exercises?lessonId=${lessonId}`,
  );
  return payload;
}
