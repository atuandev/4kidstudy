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

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}

/**
 * Login action that calls the backend authentication endpoint
 * @param values - Login form data (email, password)
 * @returns Promise with success status and message
 */
export async function login(values: LoginSchemaType): Promise<LoginResponse> {
  try {
    const { status, payload } = await http.post<LoginResponse | ErrorResponse>(
      "/auth/login",
      JSON.stringify(values),
      {
        noAuth: true,
      }
    );

    // Handle error responses
    if (status === 403) {
      const errorPayload = payload as ErrorResponse;
      const errorMessage = errorPayload.message || "Access Denied";
      
      // Check if it's an email verification error
      if (errorMessage.includes("Email not verified") || errorMessage.includes("verify your email")) {
        throw new Error("Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.");
      }
      
      // Otherwise it's wrong credentials
      throw new Error("Email hoặc mật khẩu không chính xác");
    }

    const loginPayload = payload as LoginResponse;

    if (loginPayload.user) {
      await setTokenToCookies(
        loginPayload.tokens.accessToken,
        loginPayload.tokens.refreshToken
      );
    }

    return loginPayload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Đăng nhập thất bại");
  }
}
