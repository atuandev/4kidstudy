import { z } from "zod";

export const CreateFlashcardSchema = z.object({
  topicId: z.number().int().positive("Chủ đề là bắt buộc"),
  term: z
    .string()
    .min(1, "Từ vựng là bắt buộc")
    .max(100, "Từ vựng tối đa 100 ký tự"),
  phonetic: z
    .string()
    .min(1, "Phiên âm là bắt buộc")
    .max(100, "Phiên âm tối đa 100 ký tự"),
  meaningVi: z
    .string()
    .min(1, "Nghĩa tiếng Việt là bắt buộc")
    .max(100, "Nghĩa tiếng Việt tối đa 100 ký tự"),
  exampleEn: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  exampleVi: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  imageUrl: z.string().min(1, "Hình ảnh là bắt buộc"),
  audioUrl: z.string().min(1, "Âm thanh là bắt buộc"),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

export type CreateFlashcardFormData = z.infer<typeof CreateFlashcardSchema>;

// Schema for bulk flashcards with optional id (for upsert)
export const FlashcardWithOptionalIdSchema = CreateFlashcardSchema.extend({
  id: z.number().int().positive().optional(),
  topicId: z.number().int().positive().optional(), // topicId will be set at form level
});

export const CreateFlashcardsSchema = z.object({
  topicId: z.number().int().positive("Chủ đề là bắt buộc"),
  flashcards: z
    .array(FlashcardWithOptionalIdSchema)
    .min(1, "Phải có ít nhất 1 flashcard"),
});

export type CreateFlashcardsFormData = z.infer<typeof CreateFlashcardsSchema>;
export type FlashcardWithOptionalId = z.infer<typeof FlashcardWithOptionalIdSchema>;

// Type for Excel row import
export interface ExcelFlashcardRow {
  term?: string | number;
  meaningVi?: string | number;
  phonetic?: string | number;
  ExEn?: string | number;
  ExVi?: string | number;
  img?: string | number;
  audio?: string | number;
  [key: string]: unknown;
}

// Type for progress info
export interface FlashcardProgressInfo {
  id: number;
  term: string;
  hasProgress: boolean;
  progressCount: number;
  masteredCount: number;
}

// Type for flashcard with progress
export interface FlashcardWithProgress {
  id: number;
  term: string;
  progressCount: number;
  hasMastered: boolean;
}

export const flashcardStatusLabels: Record<string, string> = {
  true: "Hoạt động",
  false: "Không hoạt động",
};
