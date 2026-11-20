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

/**
 * Provides the authenticated profile from the profile store and fetches it on first access.
 */
export function useProfile(): UseProfileResult {
  const { profile, isLoadingProfile, setProfile, setLoadingProfile } = useProfileStore();
  const fetchProfile = useCallback(async () => {
    if (isLoadingProfile) return;
    try {
      setLoadingProfile(true);
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch profile", error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [isLoadingProfile, setLoadingProfile, setProfile]);
  useEffect(() => {
    if (profile !== null || isLoadingProfile) return;
    void fetchProfile();
  }, [fetchProfile, isLoadingProfile, profile]);
  return { profile, isLoadingProfile, fetchProfile };
}
