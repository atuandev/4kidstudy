"use server";

import http from "@/lib/http";
import { getAccessToken } from "@/lib/get-token";
import { GradeValue } from "@/types/grade";

export interface LeaderboardEntry {
  userId: number;
  name: string;
  avatarUrl: string | null;
  totalScore: number;
  rank: number;
}

export interface WeeklyLeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank: number;
  weekStart: string;
  weekEnd: string;
  grade: GradeValue;
}

export async function getWeeklyLeaderboard(): Promise<WeeklyLeaderboardResponse | null> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await http.get<WeeklyLeaderboardResponse>(
      "/leaderboard/weekly",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.payload;
  } catch (error) {
    console.error("Error fetching weekly leaderboard:", error);
    return null;
  }
}
