import { z } from 'zod';
import { Gender, GradeLevel } from '@4kidstudy/contracts';

/**
 * Update profile schema
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .optional()
    .or(z.literal('')),
  grade: z.enum(GradeLevel, {
    message: 'Vui lòng chọn khối lớp hợp lệ',
  }).optional(),
  dob: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (date) => {
        if (!date || date === '') return true;
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today;
      },
      { message: 'Ngày sinh phải trước ngày hôm nay' }
    ),
  gender: z.enum(Gender, {
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

