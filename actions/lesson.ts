'use server'

import http from "@/lib/http"
import { Lesson } from "@/types"
import { revalidatePath } from "next/cache";

export async function getLessons() {
  const { payload } = await http.get<Lesson[]>('/lessons');
  return payload;
}

export async function deleteLesson(id: number) {
  const { payload } = await http.delete<Lesson>(`/lessons/${id}`);
  revalidatePath("/admin/lessons");
  return payload;
}