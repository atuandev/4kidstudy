'use server';

import { ChangePasswordSchemaType } from '@/schemas/auth';
import http from '@/lib/http';

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export async function changePassword(data: ChangePasswordSchemaType) {
  try {
    const { status, payload } = await http.post<ChangePasswordResponse>(
      '/users/me/change-password',
      JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    );

    if (status !== 200 && status !== 201) {
      throw new Error(payload?.message || 'Đổi mật khẩu thất bại');
    }

    return {
      success: true,
      message: payload?.message || 'Đổi mật khẩu thành công',
    };
  } catch (error) {
    const errorMessage =
      (error instanceof Error && error.message) || 'Đổi mật khẩu thất bại';

    return {
      success: false,
      message: errorMessage,
    };
  }
}

