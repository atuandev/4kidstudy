'use server'

import http from "@/lib/http"
import { Lesson } from "@/types"
import { CreateLessonFormData } from "@/schemas/lesson";
import { revalidatePath } from "next/cache";

export async function getLessons() {
  const { payload } = await http.get<Lesson[]>('/lessons');
  return payload;
}

export async function getLesson(id: number) {
  const { payload } = await http.get<Lesson>(`/lessons/${id}`);
  return payload;
}

export async function createLesson(data: CreateLessonFormData) {
  const { payload } = await http.post<Lesson>('/lessons', JSON.stringify(data));
  revalidatePath("/admin/lessons");
  return payload;
}

export async function updateLesson(id: number, data: CreateLessonFormData) {
  const { payload } = await http.put<Lesson>(`/lessons/${id}`, JSON.stringify(data));
  revalidatePath("/admin/lessons");
  return payload;
}

export async function deleteLesson(id: number) {
  const { payload } = await http.delete<Lesson>(`/lessons/${id}`);
  revalidatePath("/admin/lessons");
  return payload;
}