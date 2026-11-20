import { z } from "zod";

export const CreateFlashcardSchema = z.object({
  topicId: z.number().int().positive("Chủ đề là bắt buộc"),
  term: z.string().min(1, "Từ vựng là bắt buộc").max(100, "Từ vựng tối đa 100 ký tự"),
  phonetic: z.string().min(1, "Phiên âm là bắt buộc").max(100, "Phiên âm tối đa 100 ký tự"),
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

/** A new flashcard for bulk create: no topicId/order; empty optional fields omitted. */
export type NewFlashcardInput = Pick<
  CreateFlashcardFormData,
  "term" | "phonetic" | "meaningVi" | "isActive"
> & {
  exampleEn?: string;
  exampleVi?: string;
  imageUrl?: string;
  audioUrl?: string;
};

// Schema for bulk flashcards with optional id (for upsert)
export const FlashcardWithOptionalIdSchema = CreateFlashcardSchema.extend({
  id: z.number().int().positive().optional(),
  topicId: z.number().int().positive().optional(), // topicId will be set at form level
});

export const CreateFlashcardsSchema = z.object({
  topicId: z.number().int().positive("Chủ đề là bắt buộc"),
  flashcards: z.array(FlashcardWithOptionalIdSchema).min(1, "Phải có ít nhất 1 flashcard"),
});

export type CreateFlashcardsFormData = z.infer<typeof CreateFlashcardsSchema>;

export const flashcardStatusLabels: Record<string, string> = {
  true: "Hoạt động",
  false: "Không hoạt động",
};
