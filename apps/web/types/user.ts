import type { Gender, GradeLevel, UserRole } from "@4kidstudy/contracts";

export type { Gender, GradeLevel, UserRole };

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  dob?: string;
  gender: Gender;
  role: UserRole;
  xp: number;
  streakDays: number;
  isActive: boolean;
  grade: GradeLevel;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    attempts: number;
    xpLogs: number;
    streakLogs: number;
  };
}
