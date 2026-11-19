import { refine, z } from "zod";
import { GradeLevel } from "@4kidstudy/contracts";

/**
 * Login schema based on backend LoginDto
 * Matches the validation requirements from the NestJS backend
 */
export const LoginSchema = z.object({
  email: z
    .string("Email là bắt buộc")
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z
    .string("Mật khẩu là bắt buộc")
    .min(1, "Mật khẩu không được để trống")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

/**
 * Register schema based on backend RegisterDto
 * Matches the validation requirements from the NestJS backend
 */
export const RegisterSchema = z
  .object({
    name: z
      .string("Tên là bắt buộc")
      .min(1, "Tên không được để trống")
      .min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z
      .string("Email là bắt buộc")
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    password: z
      .string("Mật khẩu là bắt buộc")
      .min(1, "Mật khẩu không được để trống")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z
      .string("Xác nhận mật khẩu là bắt buộc")
      .min(1, "Xác nhận mật khẩu không được để trống"),
    grade: z.enum(GradeLevel, {
      message: "Vui lòng chọn khối lớp hợp lệ",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const VerifyEmailSchema = z.object({
  email: z
    .string("Email là bắt buộc")
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  otp: z
    .string("OTP là bắt buộc")
    .min(1, "OTP không được để trống")
    .length(6, "OTP phải có 6 ký tự"),
});

export type VerifyEmailSchemaType = z.infer<typeof VerifyEmailSchema>;

/**
 * Forget password schema
 */
export const ForgetPasswordSchema = z.object({
  email: z
    .string("Email là bắt buộc")
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
});

export type ForgetPasswordSchemaType = z.infer<typeof ForgetPasswordSchema>;

/**
 * Reset password schema
 */
export const ResetPasswordSchema = z.object({
  email: z
    .string("Email là bắt buộc")
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  newPassword: z
    .string("Mật khẩu mới là bắt buộc")
    .min(1, "Mật khẩu mới không được để trống")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

/**
 * Change password schema
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string("Mật khẩu hiện tại là bắt buộc")
      .min(1, "Mật khẩu hiện tại không được để trống")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    newPassword: z
      .string("Mật khẩu mới là bắt buộc")
      .min(1, "Mật khẩu mới không được để trống")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z
      .string("Xác nhận mật khẩu là bắt buộc")
      .min(1, "Xác nhận mật khẩu không được để trống"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
