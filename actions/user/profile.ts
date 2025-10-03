"use server";

import http from "@/lib/http";
import { User } from "@/types";

export const getProfile = async () => {
  const { payload } = await http.get<User>(`/users/me`);
  return payload;
};
