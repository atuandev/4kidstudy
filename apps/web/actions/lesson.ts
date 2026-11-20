"use server";

import http from "@/lib/http";
import { Lesson } from "@/types";
import { CreateLessonFormData, NewLessonInput } from "@/schemas/lesson";
import { revalidatePath } from "next/cache";

interface GetLessonsParams {
  skip?: number;
  take?: number;
  topicId?: number;
  status?: string;
}

export async function getLessons(params?: GetLessonsParams) {
  const queryParams = new URLSearchParams();

  if (params?.skip !== undefined) {
    queryParams.append("skip", params.skip.toString());
  }
  if (params?.take !== undefined) {
    queryParams.append("take", params.take.toString());
  }
  if (params?.topicId !== undefined) {
    queryParams.append("topicId", params.topicId.toString());
  }
  if (params?.status) {
    queryParams.append("status", params.status);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/lessons?${queryString}` : "/lessons";

  const { payload } = await http.get<Lesson[]>(url);
  return payload;
}

export async function getLesson(id: number) {
  const { payload } = await http.get<Lesson>(`/lessons/${id}`);
  return payload;
}

export async function createLesson(data: CreateLessonFormData) {
  const { payload } = await http.post<Lesson>("/lessons", JSON.stringify(data));
  revalidatePath("/admin/lessons");
  return payload;
}

export async function bulkCreateLessons(topicId: number, lessons: NewLessonInput[]) {
  const { payload } = await http.post<Lesson[]>(
    "/lessons/bulk",
    JSON.stringify({ topicId, lessons }),
  );
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
