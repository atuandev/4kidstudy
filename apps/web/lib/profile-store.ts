"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface ProfileState {
  profile: User | null;
  isLoadingProfile: boolean;
  /** The last automatic fetch failed; stops every mounted useProfile from retrying in a loop. */
  profileFetchFailed: boolean;
  setProfile: (profile: User | null) => void;
  setLoadingProfile: (isLoading: boolean) => void;
  setProfileFetchFailed: (failed: boolean) => void;
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
      profileFetchFailed: false,
      setProfile: (profile: User | null) => {
        set({ profile });
      },
      setLoadingProfile: (isLoading: boolean) => {
        set({ isLoadingProfile: isLoading });
      },
      setProfileFetchFailed: (failed: boolean) => {
        set({ profileFetchFailed: failed });
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
    },
  ),
);
