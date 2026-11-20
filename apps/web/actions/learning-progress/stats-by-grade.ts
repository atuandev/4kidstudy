"use server";

import { GradeValue } from "@/types/grade";
import http from "@/lib/http";

export interface TopItem {
  id: number;
  name: string;
  reviewCount: number;
  topicName?: string;
  topicId?: number;
}

export interface GradeLearningStats {
  totalReviewed: number;
  flashcardStats: {
    reviewed: number;
    total: number;
    percentage: number;
    topItems: TopItem[];
    allItems: TopItem[]; // All items for detail dialog
  };
  sentenceStats: {
    reviewed: number;
    total: number;
    percentage: number;
    topItems: TopItem[];
    allItems: TopItem[]; // All items for detail dialog
  };
  topicCount: number;
  topTopics: { id: number; name: string; reviewCount: number }[];
  topics: { id: number; name: string }[]; // For filter dropdown
}

const EMPTY_STATS: GradeLearningStats = {
  totalReviewed: 0,
  flashcardStats: { reviewed: 0, total: 0, percentage: 0, topItems: [], allItems: [] },
  sentenceStats: { reviewed: 0, total: 0, percentage: 0, topItems: [], allItems: [] },
  topicCount: 0,
  topTopics: [],
  topics: [],
};

/**
 * Learning statistics for the current user within one grade.
 * The API computes everything in a single request.
 */
export async function getLearningStatsByGrade(
  grade: GradeValue
): Promise<GradeLearningStats> {
  try {
    const { status, payload } = await http.get<GradeLearningStats>(
      `/learning-progress/grade-stats?grade=${grade}`
    );
    if (status !== 200 || !payload) {
      throw new Error(`Unexpected response ${status}`);
    }
    return payload;
  } catch (error) {
    console.error("Error fetching learning stats by grade:", error);
    return EMPTY_STATS;
  }
}
