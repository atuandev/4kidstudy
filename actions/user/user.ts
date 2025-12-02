'use server';

import http from '@/lib/http';
import { User } from '@/types';
import { ResetPasswordSchemaType } from '@/schemas/auth';

export const getUsers = async () => {
  const { payload } = await http.get<User[]>('/users');
  return payload;
};

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const resetPassword = async (data: ResetPasswordSchemaType): Promise<ResetPasswordResponse> => {
  try {
    const { status, payload } = await http.post<ResetPasswordResponse>(
      '/users/reset-password',
      JSON.stringify(data),
      { noAuth: true }
    );

    if (status !== 200 && status !== 201) {
      throw new Error('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
  }
};