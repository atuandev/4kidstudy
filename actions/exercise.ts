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

function cleanExerciseData(data: CreateExerciseFormData) {
  // Remove undefined values from the main object
  const cleanedData: any = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanedData[key] = value;
    }
  });

  // Clean options if they exist
  if (cleanedData.options && Array.isArray(cleanedData.options)) {
    cleanedData.options = cleanedData.options.map((option: any) => {
      const cleanedOption: any = {};
      Object.entries(option).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedOption[key] = value;
        }
      });
      return cleanedOption;
    });
  }

  return cleanedData;
}

export async function createExercise(data: CreateExerciseFormData) {
  const cleanedData = cleanExerciseData(data);
  const { payload, status } = await http.post<Exercise>(
    "/exercises",
    JSON.stringify(cleanedData)
  );
  revalidatePath("/admin/exercises");
  return { payload, status };
}

export async function updateExercise(
  id: number,
  data: Partial<CreateExerciseFormData>
) {
  const cleanedData = cleanExerciseData(data as CreateExerciseFormData);
  const { payload, status } = await http.put<Exercise>(
    `/exercises/${id}`,
    JSON.stringify(cleanedData)
  );
  revalidatePath("/admin/exercises");
  return { payload, status };
}

export async function deleteExercise(id: number) {
  const payload = await http.delete<Exercise>(`/exercises/${id}`);

  revalidatePath("/admin/exercises");
  return payload;
}
