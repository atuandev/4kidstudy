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

    // Group by unique flashcard/sentence IDs and get max reviewCount for each
    const uniqueFlashcards = new Map<number, number>(); // flashcardId -> max reviewCount
    const uniqueSentences = new Map<number, number>(); // sentenceId -> max reviewCount

    gradeProgress.forEach((item: LearningProgressItem) => {
      if (item.contentType === "FLASHCARD" && item.flashcard) {
        const id = item.flashcard.id;
        const currentMax = uniqueFlashcards.get(id) || 0;
        uniqueFlashcards.set(id, Math.max(currentMax, item.reviewCount));
      } else if (item.contentType === "SENTENCE" && item.sentence) {
        const id = item.sentence.id;
        const currentMax = uniqueSentences.get(id) || 0;
        uniqueSentences.set(id, Math.max(currentMax, item.reviewCount));
      }
    });

    // Fetch total flashcards and sentences for this grade
    const topicsResponse = await http.get<any[]>(`/topics?grade=${grade}`);
    const topics = topicsResponse.payload || [];
    
    let totalFlashcards = 0;
    let totalSentences = 0;
    
    await Promise.all(topics.map(async (topic: any) => {
      // Get flashcards count
      const flashcardRes = await http.get<any>(`/flashcards?topicId=${topic.id}`);
      totalFlashcards += flashcardRes.payload?.length || 0;
      
      // Get sentences count (need to fetch SentenceImages first, then count their sentences)
      const sentenceImagesRes = await http.get<any>(`/sentences/images/topic/${topic.id}`);
      const sentenceImages = sentenceImagesRes.payload || [];
      sentenceImages.forEach((img: any) => {
        totalSentences += img.sentences?.length || 0;
      });
    }));

    // Calculate stats based on unique items
    const flashcardReviewed = uniqueFlashcards.size;
    const sentenceReviewed = uniqueSentences.size;
    const totalReviewed = flashcardReviewed + sentenceReviewed;

    // Get all flashcards with reviewCount (sorted)
    const allFlashcards: TopItem[] = Array.from(uniqueFlashcards.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, reviewCount]) => {
        const item = gradeProgress.find(p => p.flashcard?.id === id);
        const topicId = item?.flashcard?.topicId;
        const topic = topics.find((t: any) => t.id === topicId);
        return {
          id,
          name: item?.flashcard?.term || '',
          reviewCount,
          topicName: topic?.title || '',
          topicId,
        };
      });

    // Get all sentences with reviewCount (sorted)
    const allSentences: TopItem[] = Array.from(uniqueSentences.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, reviewCount]) => {
        const item = gradeProgress.find(p => p.sentence?.id === id);
        const sentenceImage = item?.sentence?.sentenceImage;
        const topicId = sentenceImage?.topicId;
        const topic = topics.find((t: any) => t.id === topicId);
        return {
          id,
          name: item?.sentence?.text || '',
          reviewCount,
          topicName: topic?.title || '',
          topicId,
        };
      });

    // Get top 5 for summary
    const topFlashcards = allFlashcards.slice(0, 5);
    const topSentences = allSentences.slice(0, 5);

    // Count topics and their review counts
    const topicReviewCounts = new Map<number, { name: string; count: number }>();
    gradeProgress.forEach((item: LearningProgressItem) => {
      let topicId: number | undefined;
      let topicName: string | undefined;
      
      if (item.contentType === "FLASHCARD" && item.flashcard) {
        topicId = item.flashcard.topicId;
        topicName = topics.find((t: any) => t.id === topicId)?.title;
      } else if (item.contentType === "SENTENCE" && item.sentence) {
        topicId = item.sentence.sentenceImage.topicId;
        topicName = topics.find((t: any) => t.id === topicId)?.title;
      }
      
      if (topicId && topicName) {
        const current = topicReviewCounts.get(topicId) || { name: topicName, count: 0 };
        topicReviewCounts.set(topicId, { name: topicName, count: current.count + 1 });
      }
    });

    const topTopics = Array.from(topicReviewCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        reviewCount: data.count
      }));

    return {
      totalReviewed,
      flashcardStats: {
        reviewed: flashcardReviewed,
        total: totalFlashcards,
        percentage: totalFlashcards > 0 ? (flashcardReviewed / totalFlashcards) * 100 : 0,
        topItems: topFlashcards,
        allItems: allFlashcards,
      },
      sentenceStats: {
        reviewed: sentenceReviewed,
        total: totalSentences,
        percentage: totalSentences > 0 ? (sentenceReviewed / totalSentences) * 100 : 0,
        topItems: topSentences,
        allItems: allSentences,
      },
      topicCount: topics.length,
      topTopics,
      topics: topics.map((t: any) => ({ id: t.id, name: t.title })),
    };
  } catch (error) {
    console.error("Error fetching learning stats by grade:", error);
    return {
      totalReviewed: 0,
      flashcardStats: {
        reviewed: 0,
        total: 0,
        percentage: 0,
        topItems: [],
        allItems: [],
      },
      sentenceStats: {
        reviewed: 0,
        total: 0,
        percentage: 0,
        topItems: [],
        allItems: [],
      },
      topicCount: 0,
      topTopics: [],
      topics: [],
    };
  }
}
