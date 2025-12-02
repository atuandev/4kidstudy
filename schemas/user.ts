import { z } from 'zod';

/**
 * Update profile schema
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .optional()
    .or(z.literal('')),
  grade: z.enum(['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5'], {
    message: 'Vui lòng chọn khối lớp hợp lệ',
  }).optional(),
  dob: z
    .string()
    .optional()
    .or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'UNSET'], {
    message: 'Vui lòng chọn giới tính hợp lệ',
  }).optional(),
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, 'Kích thước ảnh tối đa 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'Chỉ chấp nhận file ảnh định dạng JPEG, PNG, hoặc WebP'
    )
    .optional(),
});

export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;

