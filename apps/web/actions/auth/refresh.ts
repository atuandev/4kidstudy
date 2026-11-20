"use server";

import http from "@/lib/http";
import { TokenResponse } from "@/types";

export const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  const { payload } = await http.post<TokenResponse>(
    `/auth/refresh`,
    JSON.stringify({ refreshToken }),
    {
      noAuth: true,
    },
  );

  return payload;
};
