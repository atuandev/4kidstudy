export type UserRole = 'ADMIN' | 'LEARNER';

export type Gender = 'MALE' | 'FEMALE' | 'UNSET';

export type GradeLevel = 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4' | 'GRADE_5';

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