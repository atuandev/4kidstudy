import { z } from "zod";
import { LearningContentType } from "@4kidstudy/contracts";

export const CreateLearningProgressSchema = z.object({
  contentType: z.enum(LearningContentType, {
    message: "Loại nội dung là bắt buộc",
  }),
  flashcardId: z
    .number()
    .int()
    .positive()
    .optional()
    .transform((val) => (val === undefined ? undefined : val)),
  sentenceId: z
    .number()
    .int()
    .positive()
    .optional()
    .transform((val) => (val === undefined ? undefined : val)),
});

export const ReviewContentSchema = z.object({
  contentType: z.enum(LearningContentType, {
    message: "Loại nội dung là bắt buộc",
  }),
  flashcardId: z
    .number()
    .int()
    .positive()
    .optional()
    .transform((val) => (val === undefined ? undefined : val)),
  sentenceId: z
    .number()
    .int()
    .positive()
    .optional()
    .transform((val) => (val === undefined ? undefined : val)),
  isMastered: z.boolean().optional(),
});

export type CreateLearningProgressFormData = z.infer<typeof CreateLearningProgressSchema>;
export type ReviewContentFormData = z.infer<typeof ReviewContentSchema>;
