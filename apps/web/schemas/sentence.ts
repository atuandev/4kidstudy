import { z } from "zod";

export const SentenceSchema = z.object({
  id: z.number().int().positive().optional(),
  text: z.string().min(1, "Vui lòng nhập câu tiếng Anh").max(100, "Tối đa 100 ký tự"),
  meaningVi: z.string().min(1, "Vui lòng nhập nghĩa tiếng Việt").max(100, "Tối đa 100 ký tự"),
  hintVi: z
    .string()
    .nullish()
    .transform((val) => (val && val.trim() !== "" ? val : undefined)),
  audioUrl: z.string().min(1, "Vui lòng chọn file âm thanh"),
  order: z
    .number("Vui lòng nhập thứ tự")
    .int("Vui lòng nhập thứ tự")
    .min(0, "Thứ tự phải lớn hơn 0")
    .optional(),
  isActive: z.boolean().default(true),
});

export const CreateSentenceImageSchema = z
  .object({
    topicId: z
      .number("Vui lòng chọn chủ đề")
      .int("Vui lòng chọn chủ đề")
      .positive("Vui lòng chọn chủ đề"),
    imageUrl: z.string().min(1, "Vui lòng chọn ảnh"),
    audioUrl: z
      .string()
      .nullish()
      .transform((val) => (val && val.trim() !== "" ? val : undefined)),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().default(true),
    sentences: z.array(SentenceSchema).min(1, "Cần ít nhất một câu"),
  })
  .superRefine((data, ctx) => {
    const orders = data.sentences.map((s) => s.order);
    const hasDuplicateOrder = new Set(orders).size !== orders.length;
    if (hasDuplicateOrder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Thứ tự câu bị trùng lặp",
        path: ["sentences"],
      });
    }
  });

export type CreateSentenceImageFormData = z.infer<typeof CreateSentenceImageSchema>;
export type CreateSentenceItem = z.infer<typeof SentenceSchema>;
