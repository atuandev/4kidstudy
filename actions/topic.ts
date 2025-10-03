"use server";

import http from "@/lib/http";
import { Topic } from "@/types";

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

export const deleteTopic = async (id: number) => {
  const { payload } = await http.delete<Topic>(`/topics/${id}`);
  return payload;
};