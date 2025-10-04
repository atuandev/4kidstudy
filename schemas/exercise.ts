import { z } from 'zod';

export const ExerciseType = z.enum([
  'SELECT_IMAGE',
  'MULTIPLE_CHOICE',
  'MATCHING',
  'LISTENING',
  'PRONUNCIATION',
]);

export const ExerciseOptionSchema = z.object({
  id: z.number().int().positive().optional(),
  text: z.string().nullish().transform((val) => val ?? undefined),
  imageUrl: z.string().nullish().transform((val) => val ?? ''),
  audioUrl: z.string().nullish().transform((val) => val ?? ''),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  matchKey: z.string().nullish().transform((val) => val ?? undefined),
});

export const CreateExerciseSchema = z.object({
  lessonId: z.number().int().positive('Lesson ID is required'),
  type: ExerciseType,
  order: z.number().int().min(0).default(0),
  prompt: z.string().nullish().transform((val) => val ?? undefined),
  imageUrl: z.string().nullish().transform((val) => val ?? ''),
  audioUrl: z.string().nullish().transform((val) => val ?? ''),
  targetText: z.string().nullish().transform((val) => val ?? undefined),
  hintEn: z.string().nullish().transform((val) => val ?? undefined),
  hintVi: z.string().nullish().transform((val) => val ?? undefined),
  points: z.number().int().min(1).max(100).default(10),
  difficulty: z.number().int().min(1).max(3).default(1),
  options: z.array(ExerciseOptionSchema).default([]),
});

export type CreateExerciseFormData = z.infer<typeof CreateExerciseSchema>;
export type ExerciseOption = z.infer<typeof ExerciseOptionSchema>;
export type ExerciseTypeEnum = z.infer<typeof ExerciseType>;

// Exercise type labels for UI
export const exerciseTypeLabels: Record<ExerciseTypeEnum, string> = {
  SELECT_IMAGE: 'Chọn ảnh đúng',
  MULTIPLE_CHOICE: 'Trắc nghiệm chữ',
  MATCHING: 'Ghép cặp',
  LISTENING: 'Nghe - chọn đáp án',
  PRONUNCIATION: 'Luyện phát âm (AI)',
};

// Helper to determine required fields based on exercise type
export const getRequiredFieldsByType = (type: ExerciseTypeEnum) => {
  const baseFields = ['lessonId', 'type', 'prompt'];
  
  switch (type) {
    case 'SELECT_IMAGE':
      return [...baseFields, 'options']; // Options must have imageUrl
    case 'MULTIPLE_CHOICE':
      return [...baseFields, 'options']; // Options must have text
    case 'MATCHING':
      return [...baseFields, 'options']; // Options must have matchKey
    case 'LISTENING':
      return [...baseFields, 'audioUrl', 'options'];
    case 'PRONUNCIATION':
      return [...baseFields, 'targetText'];
    default:
      return baseFields;
  }
};

// Validation for options based on exercise type
export const validateOptionsByType = (
  options: ExerciseOption[],
  type: ExerciseTypeEnum
): boolean => {
  if (!options || options.length === 0) {
    // PRONUNCIATION doesn't need options
    return type === 'PRONUNCIATION';
  }

  switch (type) {
    case 'SELECT_IMAGE':
      // All options should have imageUrl
      return options.every((opt) => opt.imageUrl);
    case 'MULTIPLE_CHOICE':
      // All options should have text
      return options.every((opt) => opt.text);
    case 'MATCHING':
      // Options should have matchKey and be in pairs
      const matchKeys = options.map((opt) => opt.matchKey).filter(Boolean);
      const uniqueKeys = [...new Set(matchKeys)];
      return (
        matchKeys.length === options.length &&
        uniqueKeys.every(
          (key) => options.filter((opt) => opt.matchKey === key).length === 2
        )
      );
    case 'LISTENING':
      // At least one correct option
      return options.some((opt) => opt.isCorrect);
    default:
      return true;
  }
};
