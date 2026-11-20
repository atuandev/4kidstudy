"use server";

import http from "@/lib/http";
import { getAccessToken } from "@/lib/get-token";

interface StreakDataPoint {
  date: string;
  xpEarned: number;
}

interface StreakStatsResponse {
  data: StreakDataPoint[];
  /** XP per day summed over every active learner in the user's grade. */
  gradeData: StreakDataPoint[];
  totalXP: number;
  /** Active learners in the user's grade, the user included. */
  gradeLearnerCount: number;
  /** Average XP per active learner in the grade over the range. */
  gradeAverageXP: number;
  days: number;
}

export async function getStreakStats(days: number = 7): Promise<StreakStatsResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await http.get<StreakStatsResponse>(`/leaderboard/streak-stats?days=${days}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.payload;
  } catch (error) {
    console.error("Error fetching streak stats:", error);
    return {
      data: [],
      gradeData: [],
      totalXP: 0,
      gradeLearnerCount: 0,
      gradeAverageXP: 0,
      days,
    };
  }
}
