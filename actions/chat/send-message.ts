"use server";

import http from "@/lib/http";
import { getAccessToken } from "@/lib/get-token";

interface ChatRequest {
  text: string;
}

interface ChatResponse {
  text: string;
}

export async function sendChatMessage(text: string): Promise<string> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await http.post<ChatResponse, ChatRequest>(
      "/chat",
      { text },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.payload.text;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Không thể gửi tin nhắn. Vui lòng thử lại!");
  }
}
