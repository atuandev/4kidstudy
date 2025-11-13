"use server";

import http from "@/lib/http";
import { getAccessToken } from "@/lib/get-token";

interface StreakDataPoint {
  date: string;
  xpEarned: number;
}

interface StreakStatsResponse {
  data: StreakDataPoint[];
  totalXP: number;
  days: number;
}

export async function getStreakStats(
  days: number = 7
): Promise<StreakStatsResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await http.get<StreakStatsResponse>(
      `/leaderboard/streak-stats?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.payload;
  } catch (error) {
    console.error("Error fetching streak stats:", error);
    return {
      data: [],
      totalXP: 0,
      days,
    };
  }
}
