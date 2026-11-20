"use server";

import http from "@/lib/http";
import { User } from "@/types";

export const getProfile = async (): Promise<User> => {
  try {
    const { status, payload } = await http.get<User>(`/users/me`);

    if (status !== 200 || !payload) {
      throw new Error("Failed to fetch profile");
    }

    return payload;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Unable to load profile. Please try again.");
  }
};
