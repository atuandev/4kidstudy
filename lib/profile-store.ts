"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface ProfileState {
  profile: User | null;
  isLoadingProfile: boolean;
  setProfile: (profile: User | null) => void;
  setLoadingProfile: (isLoading: boolean) => void;
  clearProfile: () => void;
}

/**
 * Stores the authenticated user profile in a persisted Zustand store.
 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isLoadingProfile: false,
      setProfile: (profile: User | null) => {
        set({ profile });
      },
      setLoadingProfile: (isLoading: boolean) => {
        set({ isLoadingProfile: isLoading });
      },
      clearProfile: () => {
        set({ profile: null });
      },
    }),
    {
      name: "profile-store",
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
