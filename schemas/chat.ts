import { z } from 'zod';

/**
 * Chat message schema based on backend ChatRequestDto
 * Matches the validation requirements from the NestJS backend
 */
export const ChatMessageSchema = z.object({
  message: z
    .string('Tin nhắn là bắt buộc')
    .min(1, 'Tin nhắn không được để trống')
    .max(1000, 'Tin nhắn không được vượt quá 1000 ký tự'),
});

export type ChatMessageSchemaType = z.infer<typeof ChatMessageSchema>;

/**
 * Message type for displaying in the chat UI
 */
export interface Message {
  id: string;
  text: string;
  type: 'user' | 'ai';
  timestamp: Date;
}
