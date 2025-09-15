import { refine, z } from 'zod'

/**
 * Login schema based on backend LoginDto
 * Matches the validation requirements from the NestJS backend
 */
export const LoginSchema = z.object({
  email: z
    .string('Email là bắt buộc')
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string('Mật khẩu là bắt buộc')
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

export type LoginSchemaType = z.infer<typeof LoginSchema>

/**
 * Register schema based on backend RegisterDto
 * Matches the validation requirements from the NestJS backend
 */
export const RegisterSchema = z.object({
  name: z
    .string('Tên là bắt buộc')
    .min(1, 'Tên không được để trống')
    .min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z
    .string('Email là bắt buộc')
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string('Mật khẩu là bắt buộc')
    .min(1, 'Mật khẩu không được để trống')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z
    .string('Xác nhận mật khẩu là bắt buộc')
    .min(1, 'Xác nhận mật khẩu không được để trống'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

export type RegisterSchemaType = z.infer<typeof RegisterSchema>
