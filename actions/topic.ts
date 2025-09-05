"use server";

import http from "@/lib/http";

export const getTopicsByGrade = async (grade: string) => {
  try {
    const response = await http.get(`/topics?grade=${grade}`);
    return response;
  } catch (error) {
    console.error('Error fetching topics by grade:', error);
    throw error;
  }
};