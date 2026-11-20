"use server";

import http from "@/lib/http";
import { User } from "@/types";
import { ResetPasswordSchemaType } from "@/schemas/auth";
import { UpdateProfileSchemaType } from "@/schemas/user";

export const getUsers = async () => {
  const { payload } = await http.get<User[]>("/users");
  return payload;
};

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const resetPassword = async (
  data: ResetPasswordSchemaType,
): Promise<ResetPasswordResponse> => {
  try {
    const { status, payload } = await http.post<ResetPasswordResponse>(
      "/users/reset-password",
      JSON.stringify(data),
      { noAuth: true },
    );

    if (status !== 200 && status !== 201) {
      throw new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
  }
};

export const updateProfile = async (data: UpdateProfileSchemaType): Promise<User> => {
  try {
    const formData = new FormData();

    if (data.name) {
      formData.append("name", data.name);
    }

    if (data.grade) {
      formData.append("grade", data.grade);
    }

    if (data.dob) {
      formData.append("dob", data.dob);
    }

    if (data.gender) {
      formData.append("gender", data.gender);
    }

    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }

    const { status, payload } = await http.put<User>("/users/me", formData);

    if (status !== 200) {
      throw new Error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Không thể cập nhật thông tin. Vui lòng thử lại.");
  }
};
