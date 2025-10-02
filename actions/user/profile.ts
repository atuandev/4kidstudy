"use server";

import http from "@/lib/http";

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string;
  dob: string;
  gender: string;
  xp: number;
  streakDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    attempts: number;
    xpLogs: number;
    streakLogs: number;
  };
}

export const getProfile = async () => {
  const { payload } = await http.get<UserProfileResponse>(`/users/me`);
  return payload;
};
