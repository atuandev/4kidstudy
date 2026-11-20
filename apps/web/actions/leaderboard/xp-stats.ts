"use server";

import http from "@/lib/http";
import { getAccessToken } from "@/lib/get-token";

interface XPDataPoint {
  date: string;
  xpEarned: number;
}

interface XPStatsResponse {
  data: XPDataPoint[];
  totalXP: number;
  days: number;
}

export async function getXPStats(days: number = 7): Promise<XPStatsResponse> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await http.get<XPStatsResponse>(`/leaderboard/xp-stats?days=${days}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.payload;
  } catch (error) {
    console.error("Error fetching XP stats:", error);
    return {
      data: [],
      totalXP: 0,
      days,
    };
  }
}
