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

export const register = async (data: RegisterSchemaType) => {
  try {
    const { status, payload } = await http.post<RegisterResponse>(`/auth/register`, JSON.stringify({
      email: data.email,
      name: data.name,
      password: data.password,
      grade: data.grade,
    }), {
      noAuth: true,
    })

    if (status === 409) {
      throw new Error('Email đã được sử dụng. Vui lòng sử dụng email khác.')
    }

    return payload
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Đăng ký thất bại')
  }
}
