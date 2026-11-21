"use client";

import { useCallback, useEffect } from "react";
import { getProfile } from "@/actions/user/profile";
import { useProfileStore } from "@/lib/profile-store";
import type { User } from "@/types";

interface UseProfileResult {
  profile: User | null;
  isLoadingProfile: boolean;
  fetchProfile: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const profile = useProfileStore((state) => state.profile);
  const isLoadingProfile = useProfileStore((state) => state.isLoadingProfile);
  const profileFetchFailed = useProfileStore((state) => state.profileFetchFailed);

  const fetchProfile = useCallback(async () => {
    const store = useProfileStore.getState();
    if (store.isLoadingProfile) return;
    try {
      store.setLoadingProfile(true);
      const profileData = await getProfile();
      store.setProfile(profileData);
      store.setProfileFetchFailed(false);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      store.setProfile(null);
      store.setProfileFetchFailed(true);
    } finally {
      store.setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (profile !== null || isLoadingProfile || profileFetchFailed) return;
    void fetchProfile();
  }, [fetchProfile, isLoadingProfile, profile, profileFetchFailed]);

  return { profile, isLoadingProfile, fetchProfile };
}
