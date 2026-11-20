import { z } from "zod";

/**
 * Chat message schema based on backend ChatRequestDto
 * Matches the validation requirements from the NestJS backend
 */
export const ChatMessageSchema = z.object({
  message: z
    .string("Tin nhắn là bắt buộc")
    .min(1, "Tin nhắn không được để trống")
    .max(1000, "Tin nhắn không được vượt quá 1000 ký tự"),
});

export type ChatMessageSchemaType = z.infer<typeof ChatMessageSchema>;

/**
 * Message type for displaying in the chat UI
 */
export interface Message {
  id: string;
  text: string;
  type: "user" | "ai";
  timestamp: Date;
}

export const ChatRequestSchema = z.object({
  message: z.string(),
  isTranslation: z.boolean().optional(),
});

export const TranslationSchema = z.object({
  word: z.string(),
  meaning: z.string(),
  phonetic: z.string().optional(),
  examples: z.array(z.string()).optional(),
});

export const ChatResponseSchema = z.object({
  response: z.string(),
  translation: TranslationSchema.optional(),
});

export type ChatRequestDto = z.infer<typeof ChatRequestSchema>;
export type ChatResponseDto = z.infer<typeof ChatResponseSchema>;
export type Translation = z.infer<typeof TranslationSchema>;
