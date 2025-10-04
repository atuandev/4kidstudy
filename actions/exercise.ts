"use server";

import http from "@/lib/http";
import { Exercise } from "@/types";
import { CreateExerciseFormData } from "@/schemas/exercise";
import { revalidatePath } from "next/cache";

export async function getExerciseByLessonId(lessonId: number) {
  const { payload } = await http.get<Exercise[]>(
    `/exercises/?lessonId=${lessonId}`
  );
  return payload;
}

export async function getExercises() {
  const { payload } = await http.get<Exercise[]>("/exercises");
  return payload;
}

export async function getExercise(id: number) {
  const { payload } = await http.get<Exercise>(`/exercises/${id}`);
  return payload;
}

export async function createExercise(data: CreateExerciseFormData) {
  const { payload } = await http.post<Exercise>(
    "/exercises",
    JSON.stringify(data)
  );
  revalidatePath("/admin/exercises");
  return payload;
}

export async function updateExercise(
  id: number,
  data: Partial<CreateExerciseFormData>
) {
  const { payload } = await http.put<Exercise>(
    `/exercises/${id}`,
    JSON.stringify(data)
  );
  revalidatePath("/admin/exercises");
  return payload;
}

export async function deleteExercise(id: number) {
  const { payload } = await http.delete<Exercise>(`/exercises/${id}`);

  revalidatePath("/admin/exercises");
  return payload;
}
