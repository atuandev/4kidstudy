import { z } from "zod";

/**
 * Lesson status enum
 */
export const LESSON_STATUS = {
  PUBLISHED: "PUBLISHED",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
} as const;

export type LessonStatus = (typeof LESSON_STATUS)[keyof typeof LESSON_STATUS];

/**
 * Lesson status labels for UI display
 */
export const lessonStatusLabels: Record<LessonStatus, string> = {
  PUBLISHED: "Hoạt động",
  DRAFT: "Bản nháp",
  ARCHIVED: "Không hoạt động",
};

/**
 * Schema for creating/updating a lesson
 */
export const CreateLessonSchema = z.object({
  topicId: z
    .number({
      error: "Vui lòng chọn chủ đề",
    })
    .min(1, "Vui lòng chọn chủ đề"),

  title: z
    .string({
      error: "Vui lòng nhập tiêu đề",
    })
    .min(1, "Vui lòng nhập tiêu đề")
    .max(200, "Tiêu đề không được quá 200 ký tự"),

  description: z
    .string({
      error: "Vui lòng nhập mô tả",
    })
    .min(1, "Vui lòng nhập mô tả"),

  order: z.number().optional(),

  status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"], {
    error: "Vui lòng chọn trạng thái",
  }),

  theoryText: z.string().optional().default(""),

  phoneticsNote: z.string().optional().default(""),

  grammarNote: z.string().optional().default(""),

  audioUrl: z.string().optional().default(""),

  coverImage: z.string().optional().default(""),
});

export type CreateLessonFormData = z.infer<typeof CreateLessonSchema>;
