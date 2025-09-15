"use server";

import { setTokenToCookies } from "@/lib/cookies";
import http from "@/lib/http";
import { LoginSchemaType } from "@/schemas/auth";

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    dob: string;
    gender: string;
    avatarUrl: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Login action that calls the backend authentication endpoint
 * @param values - Login form data (email, password)
 * @returns Promise with success status and message
 */
export async function login(values: LoginSchemaType): Promise<LoginResponse> {
  const { payload } = await http.post<LoginResponse>(
    "/auth/login",
    JSON.stringify(values),
    {
      noAuth: true,
    }
  );

  if (payload.user) {
    await setTokenToCookies(
      payload.tokens.accessToken,
      payload.tokens.refreshToken
    );
  }

  return payload;
}
