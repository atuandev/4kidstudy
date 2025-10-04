import { z } from 'zod';

export const CreateFlashcardSchema = z.object({
  topicId: z.number().int().positive('Chủ đề là bắt buộc'),
  term: z.string().min(1, 'Từ vựng là bắt buộc'),
  phonetic: z.string().min(1, 'Phiên âm là bắt buộc'),
  meaningVi: z.string().min(1, 'Nghĩa tiếng Việt là bắt buộc'),
  exampleEn: z.string().nullish().transform((val) => {
    if (!val || val.trim() === '') return undefined;
    return val;
  }),
  exampleVi: z.string().nullish().transform((val) => {
    if (!val || val.trim() === '') return undefined;
    return val;
  }),
  imageUrl: z.string().nullish().transform((val) => {
    if (!val || val.trim() === '') return undefined;
    return val;
  }),
  audioUrl: z.string().nullish().transform((val) => {
    if (!val || val.trim() === '') return undefined;
    return val;
  }),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
});

export type CreateFlashcardFormData = z.infer<typeof CreateFlashcardSchema>;

export const flashcardStatusLabels: Record<string, string> = {
  true: 'Hoạt động',
  false: 'Không hoạt động',
};

