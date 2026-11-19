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

interface LoginResult {
  success: boolean;
  data?: LoginResponse;
  error?: string;
}

/**
 * Login action that calls the backend authentication endpoint
 * @param values - Login form data (email, password)
 * @returns Promise with success status and data or error message
 */
export async function login(values: LoginSchemaType): Promise<LoginResult> {
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
        return {
          success: false,
          error: "Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản."
        };
      }
      
      // Otherwise it's wrong credentials
      return {
        success: false,
        error: "Email hoặc mật khẩu không chính xác"
      };
    }

    // Handle non-200 status codes
    if (status !== 200 && status !== 201) {
      const errorPayload = payload as ErrorResponse;
      return {
        success: false,
        error: errorPayload.message || "Đăng nhập thất bại"
      };
    }

    const loginPayload = payload as LoginResponse;

    // Validate response structure
    if (!loginPayload.user || !loginPayload.tokens) {
      return {
        success: false,
        error: "Phản hồi từ máy chủ không hợp lệ"
      };
    }

    // Set tokens to cookies
    await setTokenToCookies(
      loginPayload.tokens.accessToken,
      loginPayload.tokens.refreshToken
    );

    return {
      success: true,
      data: loginPayload
    };
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", error);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Đăng nhập thất bại"
    };
  }
}
