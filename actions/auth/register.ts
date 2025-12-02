'use server'

import http from '@/lib/http'
import { RegisterSchemaType } from '@/schemas/auth'

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    dob?: string;
    gender: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}

interface RegisterResult {
  success: boolean;
  data?: RegisterResponse;
  error?: string;
}

export const register = async (data: RegisterSchemaType): Promise<RegisterResult> => {
  try {
    const { status, payload } = await http.post<RegisterResponse | ErrorResponse>(`/auth/register`, JSON.stringify({
      email: data.email,
      name: data.name,
      password: data.password,
      grade: data.grade,
    }), {
      noAuth: true,
    })

    // Handle conflict (email already exists)
    if (status === 409) {
      return {
        success: false,
        error: 'Email đã được sử dụng. Vui lòng sử dụng email khác.'
      };
    }

    // Handle other error status codes
    if (status !== 200 && status !== 201) {
      const errorPayload = payload as ErrorResponse;
      return {
        success: false,
        error: errorPayload.message || 'Đăng ký thất bại'
      };
    }

    const registerPayload = payload as RegisterResponse;

    // Validate response structure
    if (!registerPayload.user) {
      return {
        success: false,
        error: 'Phản hồi từ máy chủ không hợp lệ'
      };
    }

    return {
      success: true,
      data: registerPayload
    };
  } catch (error) {
    // Log error only in development
    if (process.env.NODE_ENV === "development") {
      console.error("Register error:", error);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đăng ký thất bại'
    };
  }
}
