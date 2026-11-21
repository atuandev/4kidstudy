"use server";

import http from "@/lib/http";
import { CreateLearningProgressFormData, ReviewContentFormData } from "@/schemas/learning-progress";
import { LearningProgress, LearningProgressStats, TopicProgress } from "@/types";

export async function createOrGetProgress(
  data: CreateLearningProgressFormData,
): Promise<LearningProgress> {
  const { payload } = await http.post<LearningProgress>("/learning-progress", JSON.stringify(data));
  return payload;
}

export async function reviewContent(data: ReviewContentFormData): Promise<LearningProgress> {
  const { payload } = await http.post<LearningProgress>(
    "/learning-progress/review",
    JSON.stringify(data),
  );
  return payload;
}

export async function getUserStats(): Promise<LearningProgressStats> {
  const { payload } = await http.get<LearningProgressStats>("/learning-progress/stats");
  return payload;
}

export async function getTopicProgress(topicId: number): Promise<TopicProgress> {
  const { payload } = await http.get<TopicProgress>(`/learning-progress/topic/${topicId}`);
  return payload;
}

export async function getReviewedFlashcardIds(topicId: number): Promise<number[]> {
  const { payload } = await http.get<{ flashcardIds: number[] }>(
    `/learning-progress/topic/${topicId}/reviewed-flashcards`,
  );
  return payload.flashcardIds;
}

export async function getReviewedSentenceIds(topicId: number): Promise<number[]> {
  const { payload } = await http.get<{ sentenceIds: number[] }>(
    `/learning-progress/topic/${topicId}/reviewed-sentences`,
  );
  return payload.sentenceIds;
}

export async function getMasteredSentenceIds(topicId: number): Promise<number[]> {
  const { payload } = await http.get<{ sentenceIds: number[] }>(
    `/learning-progress/topic/${topicId}/reviewed-sentences`,
  );
  return payload.sentenceIds;
}

export async function getLastReviewedTopic(): Promise<number | null> {
  const { payload } = await http.get<{ topicId: number | null }>("/learning-progress/last-topic");
  return payload.topicId;
}
