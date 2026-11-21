import { z } from "zod";
import { LessonStatus } from "@4kidstudy/contracts";

export const LESSON_STATUS = LessonStatus;

export type { LessonStatus };

export const lessonStatusLabels: Record<LessonStatus, string> = {
  PUBLISHED: "Hoạt động",
  DRAFT: "Bản nháp",
  ARCHIVED: "Không hoạt động",
};

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

  status: z.enum(LessonStatus, {
    error: "Vui lòng chọn trạng thái",
  }),

  theoryText: z.string().optional().default(""),

  phoneticsNote: z.string().optional().default(""),

  grammarNote: z.string().optional().default(""),

  audioUrl: z.string().optional().default(""),

  coverImage: z.string().optional().default(""),
});

export type CreateLessonFormData = z.infer<typeof CreateLessonSchema>;

export type NewLessonInput = Pick<CreateLessonFormData, "title" | "description" | "status"> &
  Partial<
    Pick<
      CreateLessonFormData,
      "theoryText" | "phoneticsNote" | "grammarNote" | "audioUrl" | "coverImage"
    >
  >;

export const LessonWithOptionalIdSchema = z.object({
  id: z.number().optional(),

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

  status: z.enum(LessonStatus, {
    error: "Vui lòng chọn trạng thái",
  }),

  theoryText: z.string().optional().default(""),

  phoneticsNote: z.string().optional().default(""),

  grammarNote: z.string().optional().default(""),

  audioUrl: z.string().optional().default(""),

  coverImage: z.string().optional().default(""),
});

export const CreateLessonsSchema = z.object({
  topicId: z
    .number({
      error: "Vui lòng chọn chủ đề",
    })
    .min(1, "Vui lòng chọn chủ đề"),

  lessons: z.array(LessonWithOptionalIdSchema).min(1, "Phải có ít nhất một bài luyện tập"),
});

export type LessonWithOptionalIdFormData = z.infer<typeof LessonWithOptionalIdSchema>;
export type CreateLessonsFormData = z.infer<typeof CreateLessonsSchema>;
