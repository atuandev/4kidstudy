export type UserRole = 'ADMIN' | 'LEARNER';

export type Gender = 'MALE' | 'FEMALE' | 'UNSET';

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
  createdAt: string;
  updatedAt: string;
  _count: {
    attempts: number;
    xpLogs: number;
    streakLogs: number;
  };
}