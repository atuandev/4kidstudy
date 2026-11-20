import { z } from "zod";
import { GradeLevel } from "@4kidstudy/contracts";

export const CreateTopicSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  grade: z.enum(GradeLevel, {
    message: "Lớp là bắt buộc",
  }),
  coverImage: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

export type CreateTopicFormData = z.infer<typeof CreateTopicSchema>;

export const topicStatusLabels: Record<string, string> = {
  true: "Hoạt động",
  false: "Không hoạt động",
};

export const gradeLabels: Record<string, string> = {
  GRADE_1: "Lớp 1",
  GRADE_2: "Lớp 2",
  GRADE_3: "Lớp 3",
  GRADE_4: "Lớp 4",
  GRADE_5: "Lớp 5",
};
