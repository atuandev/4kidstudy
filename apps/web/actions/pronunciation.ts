"use server";

import http from "@/lib/http";

export type PronunciationAssessmentResponse = {
  success: boolean;
  accuracy?: number;
  fluency?: number;
  completeness?: number;
  prosody?: number;
  overall?: number;
  recognizedText?: string;
  error?: string;
  words?: Array<{
    word: string;
    accuracy: number;
    errorType?: string;
  }>;
  rawResult?: Record<string, unknown>;
};

export async function assessPronunciation(
  audioFile: Blob | File,
  referenceText: string,
): Promise<PronunciationAssessmentResponse> {
  const formData = new FormData();

  const mimeType = audioFile.type || "audio/webm";
  const extension = mimeType.includes("webm")
    ? "webm"
    : mimeType.includes("ogg")
      ? "ogg"
      : mimeType.includes("mp3")
        ? "mp3"
        : "webm";

  const file =
    audioFile instanceof File
      ? audioFile
      : new File([audioFile], `recording.${extension}`, { type: mimeType });

  formData.append("audioFile", file);
  formData.append("referenceText", referenceText);

  try {
    const { payload, status } = await http.post<PronunciationAssessmentResponse>(
      "/pronunciation/assess",
      formData,
      { isFileUpload: true },
    );

    if (payload && typeof payload === "object") {
    }

    if (status !== 200 && status !== 201) {
      let errorMessage = `Failed to assess pronunciation (HTTP ${status})`;

      if (payload) {
        if (typeof payload === "object") {
          if ("error" in payload && typeof payload.error === "string") {
            errorMessage = payload.error;
          } else if ("message" in payload) {
            errorMessage = Array.isArray(payload.message)
              ? payload.message.join(", ")
              : String(payload.message);
          } else if ("success" in payload && payload.success === false && "error" in payload) {
            errorMessage = String(payload.error);
          }
        }
      }

      console.error("[Pronunciation API] HTTP error:", errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (!payload) {
      console.error("[Pronunciation API] No payload received from server (status:", status, ")");
      return {
        success: false,
        error: `No response from server (HTTP ${status})`,
      };
    }

    if (payload.success === false) {
      const errorMsg = payload.error || "Failed to assess pronunciation (unknown error)";
      return {
        success: false,
        error: errorMsg,
      };
    }

    if (payload.overall === undefined) {
      return {
        success: false,
        error: payload.error || "Invalid response from server (missing score)",
      };
    }

    return payload;
  } catch (error) {
    console.error("[Pronunciation API] Exception caught:", error);
    console.error("[Pronunciation API] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assess pronunciation",
    };
  }
}
