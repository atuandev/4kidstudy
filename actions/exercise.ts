"use server";

import http from "@/lib/http";
import { Exercise } from "@/types";

export async function getExerciseByLessonId(lessonId: number) {
  const { payload } = await http.get<Exercise[]>(`/exercises/?lessonId=${lessonId}`);
  return payload;
}
