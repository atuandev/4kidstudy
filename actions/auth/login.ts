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
  try {
    const { status, payload } = await http.post<LoginResponse>(
      "/auth/login",
      JSON.stringify(values),
      {
        noAuth: true,
      }
    );

    if (status === 403) {
      throw new Error("Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.");
    }

    if (payload.user) {
      await setTokenToCookies(
        payload.tokens.accessToken,
        payload.tokens.refreshToken
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Đăng nhập thất bại");
  }
}
