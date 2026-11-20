"use server";

import http from "@/lib/http";
import { ChatRequestDto, ChatResponseDto } from "@/schemas/chat";

export async function sendChatMessage(
  message: string,
  isTranslation?: boolean,
): Promise<ChatResponseDto> {
  const body: ChatRequestDto = {
    message,
    isTranslation,
  };
  const res = await http.post<ChatResponseDto>("/chat", JSON.stringify(body));

  return res.payload;
}

export async function getChatHistory() {
  const res =
    await http.get<{ role: string; content: string; createdAt: string }[]>("/chat/history");
  return res.payload;
}

export async function clearChatHistory() {
  await http.delete("/chat/history");
}
