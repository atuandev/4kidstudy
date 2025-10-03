"use server";

import http from "@/lib/http";
import { Exercise } from "@/types";

export async function getExerciseByLessonId(lessonId: number) {
  const { payload } = await http.get<Exercise[]>(`/exercises/?lessonId=${lessonId}`);
  return payload;
}

export async function getExercises() {
  const { payload } = await http.get<Exercise[]>("/exercises");
  return payload;
}

export async function deleteExercise(id: number) {
  const { payload } = await http.delete<Exercise>(`/exercises/${id}`);
  return payload;
}