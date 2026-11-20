"use client";

import { useEffect } from "react";

import { useProfileStore } from "@/lib/profile-store";

/**
 * Forgets the cached profile whenever an auth page opens (after logout or an expired
 * session), so the next person to sign in never sees the previous learner's name or XP.
 * It runs here rather than on the logout button because the learner shell is unmounted
 * by now, so nothing refetches the profile with the old cookie.
 */
export function ClearProfile() {
  useEffect(() => {
    useProfileStore.getState().clearProfile();
  }, []);
  return null;
}
