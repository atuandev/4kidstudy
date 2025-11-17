import { z } from "zod";

export const ExerciseType = z.enum([
  "SELECT_IMAGE",
  "MULTIPLE_CHOICE",
  "MATCHING",
  "LISTENING",
  "PRONUNCIATION",
]);

export const ExerciseOptionSchema = z.object({
  id: z.number().int().positive().optional(),
  text: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  imageUrl: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  audioUrl: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  matchKey: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    }),
});

export const CreateExerciseSchema = z
  .object({
    id: z.number().int().positive().optional(),
    lessonId: z.number().int().positive("Lesson ID is required"),
    type: ExerciseType,
    order: z.number().int().min(0).optional(),
    prompt: z
      .string()
      .min(1, "Câu hỏi phải có ít nhất 1 ký tự")
      .max(100, "Câu hỏi tối đa 100 ký tự"),
    imageUrl: z
      .string()
      .nullish()
      .transform((val) => {
        if (!val || val.trim() === "") return undefined;
        return val;
      }),
    audioUrl: z
      .string()
      .nullish()
      .transform((val) => {
        if (!val || val.trim() === "") return undefined;
        return val;
      }),
    targetText: z.preprocess((val) => {
      if (typeof val !== "string") return val;
      const v = val.trim();
      return v === "" ? undefined : v;
    }, z.string().min(1, "Văn bản cần đọc tối thiểu 1 ký tự").max(100, "Văn bản cần đọc tối đa 100 ký tự").optional()),
    hintEn: z.preprocess((val) => {
      if (typeof val !== "string") return val;
      const v = val.trim();
      return v === "" ? undefined : v;
    }, z.string().min(1, "Đáp án Tiếng Anh tối thiểu 1 ký tự").max(100, "Đáp án Tiếng Anh tối đa 100 ký tự").optional()),
    hintVi: z.preprocess((val) => {
      if (typeof val !== "string") return val;
      const v = val.trim();
      return v === "" ? undefined : v;
    }, z.string().min(1, "Đáp án Tiếng Việt tối thiểu 1 ký tự").max(100, "Đáp án Tiếng Việt tối đa 100 ký tự").optional()),
    points: z.number().int().min(1).max(100).default(10),
    difficulty: z.number().int().min(1).max(3).default(1),
    options: z.array(ExerciseOptionSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // Validate PRONUNCIATION type requires targetText and audioUrl
    if (data.type === "PRONUNCIATION") {
      if (!data.targetText) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Văn bản cần đọc là bắt buộc cho bài tập phát âm",
          path: ["targetText"],
        });
      }
      if (!data.audioUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File âm thanh là bắt buộc cho bài tập phát âm",
          path: ["audioUrl"],
        });
      }
    }

    // Validate LISTENING type requires audioUrl
    if (data.type === "LISTENING") {
      if (!data.audioUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "File âm thanh là bắt buộc cho bài tập nghe",
          path: ["audioUrl"],
        });
      }
    }

    // Validate options for non-PRONUNCIATION types
    if (
      data.type !== "PRONUNCIATION" &&
      (!data.options || data.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cần có ít nhất một đáp án",
        path: ["options"],
      });
    }

    // Validate exactly one correct answer for multiple choice types
    if (["MULTIPLE_CHOICE", "SELECT_IMAGE", "LISTENING"].includes(data.type)) {
      const correctAnswersCount =
        data.options?.filter((opt) => opt.isCorrect).length ?? 0;
      if (correctAnswersCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cần có ít nhất một đáp án đúng",
          path: ["options"],
        });
      } else if (correctAnswersCount > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chỉ được có một đáp án đúng",
          path: ["options"],
        });
      }
    }

    // Validate option content based on exercise type
    if (data.options && data.options.length > 0) {
      if (["MULTIPLE_CHOICE", "SELECT_IMAGE", "LISTENING"].includes(data.type)) {
        const identifiers = data.options
          .map((option) => {
            if (data.type === "SELECT_IMAGE") {
              return option.imageUrl?.trim();
            }
            return option.text?.trim();
          })
          .filter((value) => value && value.length > 0);

        const uniqueIdentifiers = new Set(identifiers);

        if (identifiers.length !== uniqueIdentifiers.size) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Các đáp án không được trùng nhau",
            path: ["options"],
          });
        }
      }

      if (data.type === "MATCHING") {
        const matchKeyCounts = data.options.reduce<Map<string, number>>(
          (counts, option) => {
            const key = option.matchKey?.trim();
            if (!key) {
              return counts;
            }
            const currentCount = counts.get(key) ?? 0;
            counts.set(key, currentCount + 1);
            return counts;
          },
          new Map<string, number>()
        );

        const invalidMatchKey = Array.from(matchKeyCounts.entries()).find(
          ([, count]) => count < 2
        );

        if (invalidMatchKey) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mỗi Match Key cần hai đáp án",
            path: ["options"],
          });
        }

        const excessiveMatchKey = Array.from(matchKeyCounts.entries()).find(
          ([, count]) => count > 2
        );

        if (excessiveMatchKey) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mỗi Match Key chỉ được tối đa hai đáp án",
            path: ["options"],
          });
        }
      }

      data.options.forEach((option, index) => {
        // SELECT_IMAGE requires imageUrl
        if (data.type === "SELECT_IMAGE") {
          if (!option.imageUrl) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Hình ảnh là bắt buộc",
              path: ["options", index, "imageUrl"],
            });
          }
        }

        // MULTIPLE_CHOICE and LISTENING require text
        if (["MULTIPLE_CHOICE", "LISTENING"].includes(data.type)) {
          if (!option.text) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nội dung đáp án là bắt buộc",
              path: ["options", index, "text"],
            });
          }
        }

        // MATCHING requires matchKey and text/imageUrl
        if (data.type === "MATCHING") {
          if (!option.matchKey) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Match Key là bắt buộc",
              path: ["options", index, "matchKey"],
            });
          }
          // At least text or imageUrl should be present
          const hasText = option.text !== undefined;
          const hasImage = option.imageUrl !== undefined;
          if (!hasText && !hasImage) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Cần có văn bản hoặc hình ảnh",
              path: ["options", index, "text"],
            });
          }
        }
      });
    }
  });

export type CreateExerciseFormData = z.infer<typeof CreateExerciseSchema>;
export type ExerciseOption = z.infer<typeof ExerciseOptionSchema>;
export type ExerciseTypeEnum = z.infer<typeof ExerciseType>;

// Exercise type labels for UI
export const exerciseTypeLabels: Record<ExerciseTypeEnum, string> = {
  SELECT_IMAGE: "Chọn ảnh đúng",
  MULTIPLE_CHOICE: "Chọn đáp án đúng",
  MATCHING: "Ghép cặp",
  LISTENING: "Nghe - chọn đáp án",
  PRONUNCIATION: "Luyện phát âm (AI)",
};

// Helper to determine required fields based on exercise type
export const getRequiredFieldsByType = (type: ExerciseTypeEnum) => {
  const baseFields = ["lessonId", "type", "prompt"];

  switch (type) {
    case "SELECT_IMAGE":
      return [...baseFields, "options"]; // Options must have imageUrl
    case "MULTIPLE_CHOICE":
      return [...baseFields, "options"]; // Options must have text
    case "MATCHING":
      return [...baseFields, "options"]; // Options must have matchKey
    case "LISTENING":
      return [...baseFields, "audioUrl", "options"];
    case "PRONUNCIATION":
      return [...baseFields, "targetText", "audioUrl"];
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
    return type === "PRONUNCIATION";
  }

  switch (type) {
    case "SELECT_IMAGE":
      // All options should have imageUrl
      return options.every((opt) => opt.imageUrl);
    case "MULTIPLE_CHOICE":
      // All options should have text
      return options.every((opt) => opt.text);
    case "MATCHING":
      // Options should have matchKey and be in pairs
      const matchKeys = options.map((opt) => opt.matchKey).filter(Boolean);
      const uniqueKeys = [...new Set(matchKeys)];
      return (
        matchKeys.length === options.length &&
        uniqueKeys.every(
          (key) => options.filter((opt) => opt.matchKey === key).length === 2
        )
      );
    case "LISTENING":
      // At least one correct option
      return options.some((opt) => opt.isCorrect);
    default:
      return true;
  }
};
