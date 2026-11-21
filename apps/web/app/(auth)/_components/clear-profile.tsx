"use client";

import { useEffect } from "react";

import { useProfileStore } from "@/lib/profile-store";

export function ClearProfile() {
  useEffect(() => {
    useProfileStore.getState().clearProfile();
  }, []);
  return null;
}
