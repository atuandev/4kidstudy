"use server";

import http from "@/lib/http";
import { getAccessToken } from "@/lib/get-token";

interface TopicXPDataPoint {
  topicId: number;
  topicTitle: string;
  xpEarned: number;
  /** XP in this topic summed over every active learner in the user's grade. */
  gradeXpEarned: number;
}

interface TopicXPStatsResponse {
  data: TopicXPDataPoint[];
  totalXP: number;
}

export async function getTopicXPStats(days: number = 7): Promise<TopicXPStatsResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await http.get<TopicXPStatsResponse>(
      `/leaderboard/topic-xp-stats?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.payload;
  } catch (error) {
    console.error("Error fetching topic XP stats:", error);
    return {
      data: [],
      totalXP: 0,
    };
  }
}
