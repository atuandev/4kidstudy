"use server";

import { getAccessToken } from "@/lib/get-token";
import { GradeValue } from "@/types/grade";
import http from "@/lib/http";

interface LearningProgressItem {
  id: number;
  contentType: "FLASHCARD" | "SENTENCE";
  isMastered: boolean;
  reviewCount: number;
  flashcard?: {
    id: number;
    term: string;
    meaningVi: string;
    imageUrl?: string;
    audioUrl?: string;
    topicId: number;
    topic: {
      id: number;
      grade: GradeValue;
    };
  };
  sentence?: {
    id: number;
    text: string;
    meaningVi?: string;
    audioUrl?: string;
    sentenceImageId: number;
    sentenceImage: {
      id: number;
      topicId: number;
      topic: {
        id: number;
        grade: GradeValue;
      };
    };
  };
}

interface LearningProgressResponse {
  data: LearningProgressItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GradeLearningStats {
  totalReviewed: number;
  totalMastered: number;
  masteryRate: number;
  flashcardStats: {
    total: number;
    mastered: number;
    masteryRate: number;
  };
  sentenceStats: {
    total: number;
    mastered: number;
    masteryRate: number;
  };
  topicCount: number;
}

export async function getLearningStatsByGrade(
  grade: GradeValue
): Promise<GradeLearningStats> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    // Fetch all learning progress with a large limit to get all data
    // We'll filter by grade on the client side since backend doesn't support grade filtering
    const response = await http.get<LearningProgressResponse>(
      "/learning-progress?page=1&limit=10000",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const allProgress = response.payload.data;

    // Filter by grade with safe checks
    const gradeProgress = allProgress.filter((item: LearningProgressItem) => {
      if (item.contentType === "FLASHCARD" && item.flashcard?.topic) {
        return item.flashcard.topic.grade === grade;
      } else if (item.contentType === "SENTENCE" && item.sentence?.sentenceImage?.topic) {
        return item.sentence.sentenceImage.topic.grade === grade;
      }
      return false;
    });

    // Calculate stats based on review count (considered mastered if reviewed >= 3 times)
    const totalReviewed = gradeProgress.length;
    const totalMastered = gradeProgress.filter((p: LearningProgressItem) => p.reviewCount >= 3).length;

    const flashcardProgress = gradeProgress.filter(
      (p: LearningProgressItem) => p.contentType === "FLASHCARD"
    );
    const flashcardTotal = flashcardProgress.length;
    const flashcardMastered = flashcardProgress.filter(
      (p: LearningProgressItem) => p.reviewCount >= 3
    ).length;

    const sentenceProgress = gradeProgress.filter(
      (p: LearningProgressItem) => p.contentType === "SENTENCE"
    );
    const sentenceTotal = sentenceProgress.length;
    const sentenceMastered = sentenceProgress.filter(
      (p: LearningProgressItem) => p.reviewCount >= 3
    ).length;

    // Count unique topics
    const topicIds = new Set<number>();
    gradeProgress.forEach((item: LearningProgressItem) => {
      if (item.contentType === "FLASHCARD" && item.flashcard) {
        topicIds.add(item.flashcard.topicId);
      } else if (item.contentType === "SENTENCE" && item.sentence) {
        topicIds.add(item.sentence.sentenceImage.topicId);
      }
    });

    return {
      totalReviewed,
      totalMastered,
      masteryRate: totalReviewed > 0 ? (totalMastered / totalReviewed) * 100 : 0,
      flashcardStats: {
        total: flashcardTotal,
        mastered: flashcardMastered,
        masteryRate:
          flashcardTotal > 0 ? (flashcardMastered / flashcardTotal) * 100 : 0,
      },
      sentenceStats: {
        total: sentenceTotal,
        mastered: sentenceMastered,
        masteryRate:
          sentenceTotal > 0 ? (sentenceMastered / sentenceTotal) * 100 : 0,
      },
      topicCount: topicIds.size,
    };
  } catch (error) {
    console.error("Error fetching learning stats by grade:", error);
    return {
      totalReviewed: 0,
      totalMastered: 0,
      masteryRate: 0,
      flashcardStats: {
        total: 0,
        mastered: 0,
        masteryRate: 0,
      },
      sentenceStats: {
        total: 0,
        mastered: 0,
        masteryRate: 0,
      },
      topicCount: 0,
    };
  }
}
