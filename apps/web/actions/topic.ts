"use server";

import http from "@/lib/http";
import { Topic } from "@/types";
import { revalidatePath } from "next/cache";
import { CreateTopicFormData } from "@/schemas/topic";

export const getTopicsByGrade = async (grade: string) => {
  try {
    const response = await http.get<Topic[]>(`/topics?grade=${grade}`);
    return response;
  } catch (error) {
    console.error("Error fetching topics by grade:", error);
    throw error;
  }
};

export const getTopicById = async (id: number) => {
  const { payload } = await http.get<Topic>(`/topics/${id}`);
  return payload;
};

export const getTopics = async () => {
  const { payload } = await http.get<Topic[]>(`/topics`);
  return payload;
};

export const createTopic = async (data: CreateTopicFormData) => {
  const { payload } = await http.post<Topic>("/topics", JSON.stringify(data));
  revalidatePath("/admin/topics");
  return payload;
};

export const updateTopic = async (id: number, data: CreateTopicFormData) => {
  const { payload } = await http.put<Topic>(`/topics/${id}`, JSON.stringify(data));
  revalidatePath("/admin/topics");
  return payload;
};

export const deleteTopic = async (id: number) => {
  const { payload } = await http.delete<Topic>(`/topics/${id}`);
  revalidatePath("/admin/topics");
  return payload;
};
