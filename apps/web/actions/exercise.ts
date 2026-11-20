"use server";

import http from "@/lib/http";
import { Exercise } from "@/types";
import { CreateExerciseFormData } from "@/schemas/exercise";
import { revalidatePath } from "next/cache";
import { expireTopicsCache } from "@/lib/data/topic-cache";

export async function getExerciseByLessonId(lessonId: number) {
  const { payload } = await http.get<Exercise[]>(`/exercises/?lessonId=${lessonId}`);
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

/** Copy of `obj` without keys whose value is `undefined`. */
function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;
}

function cleanExerciseData(data: CreateExerciseFormData): CreateExerciseFormData {
  const cleanedData = omitUndefined(data);

  // Clean options if they exist
  if (Array.isArray(cleanedData.options)) {
    cleanedData.options = cleanedData.options.map(omitUndefined);
  }

  return cleanedData;
}

export async function createExercise(data: CreateExerciseFormData) {
  const cleanedData = cleanExerciseData(data);
  const { payload, status } = await http.post<Exercise>("/exercises", JSON.stringify(cleanedData));
  revalidatePath("/admin/exercises");
  expireTopicsCache();
  return { payload, status };
}

export async function createManyExercises(exercises: CreateExerciseFormData[]) {
  const cleanedExercises = exercises.map((exercise) => cleanExerciseData(exercise));
  const { payload, status } = await http.post<Exercise[]>(
    "/exercises/bulk",
    JSON.stringify({ exercises: cleanedExercises }),
  );
  revalidatePath("/admin/exercises");
  expireTopicsCache();
  return { payload, status };
}

export async function updateExercise(id: number, data: Partial<CreateExerciseFormData>) {
  const cleanedData = cleanExerciseData(data as CreateExerciseFormData);
  const { payload, status } = await http.put<Exercise>(
    `/exercises/${id}`,
    JSON.stringify(cleanedData),
  );
  revalidatePath("/admin/exercises");
  expireTopicsCache();
  return { payload, status };
}

export async function deleteExercise(id: number) {
  const payload = await http.delete<Exercise>(`/exercises/${id}`);

  revalidatePath("/admin/exercises");
  expireTopicsCache();
  return payload;
}

export async function importExercisesFromCsv(formData: FormData) {
  const { payload } = await http.post<{
    exercisesCreated: number;
    optionsCreated: number;
  }>("/exercises/import", formData, { isFileUpload: true });

  revalidatePath("/admin/exercises");
  revalidatePath("/admin/lessons");
  expireTopicsCache();
  return payload;
}
