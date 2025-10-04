'use server'

import http from "@/lib/http"
import { Lesson } from "@/types"

export async function getLessons() {
  const { payload } = await http.get<Lesson[]>('/lessons');
  return payload;
}

export async function deleteLesson(id: number) {
  const { payload } = await http.delete<Lesson>(`/lessons/${id}`);
  return payload;
}