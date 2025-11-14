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
  rawResult?: Record<string, any>;
};

/**
 * Assess pronunciation from audio file
 * @param audioFile - The audio file (Blob or File)
 * @param referenceText - The correct text that should be spoken
 * @returns Pronunciation assessment response
 */
export async function assessPronunciation(
  audioFile: Blob | File,
  referenceText: string
): Promise<PronunciationAssessmentResponse> {
  const formData = new FormData();
  
  // Convert Blob to File if needed
  // MediaRecorder typically produces webm format, but we'll let the backend handle conversion
  // Use the blob's type if available, otherwise default to webm
  const mimeType = audioFile.type || "audio/webm";
  const extension = mimeType.includes("webm") ? "webm" : 
                   mimeType.includes("ogg") ? "ogg" : 
                   mimeType.includes("mp3") ? "mp3" : "webm";
  
  const file = audioFile instanceof File 
    ? audioFile 
    : new File([audioFile], `recording.${extension}`, { type: mimeType });
  
  formData.append("audioFile", file);
  formData.append("referenceText", referenceText);

  try {
    const { payload, status } = await http.post<PronunciationAssessmentResponse>(
      "/pronunciation/assess",
      formData,
      { isFileUpload: true }
    );

    // Debug logging - always log to help diagnose issues
    console.log("[Pronunciation API] Status:", status);
    console.log("[Pronunciation API] Payload:", payload);
    console.log("[Pronunciation API] Payload type:", typeof payload);
    if (payload && typeof payload === 'object') {
      console.log("[Pronunciation API] Payload keys:", Object.keys(payload));
      console.log("[Pronunciation API] Payload.success:", (payload as any).success);
      console.log("[Pronunciation API] Payload.error:", (payload as any).error);
    }
    
    // Check if HTTP request failed
    if (status !== 200 && status !== 201) {
      // Extract error message from payload
      let errorMessage = `Failed to assess pronunciation (HTTP ${status})`;
      
      if (payload) {
        // Backend might return error in different formats
        if (typeof payload === 'object') {
          if ('error' in payload && typeof payload.error === 'string') {
            errorMessage = payload.error;
          } else if ('message' in payload) {
            errorMessage = Array.isArray(payload.message) 
              ? payload.message.join(', ') 
              : String(payload.message);
          } else if ('success' in payload && payload.success === false && 'error' in payload) {
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

    // Check if payload exists
    if (!payload) {
      console.error("[Pronunciation API] No payload received from server (status:", status, ")");
      return {
        success: false,
        error: `No response from server (HTTP ${status})`,
      };
    }

    // Backend returns success: false in payload even with HTTP 200
    // So check the payload.success field
    if (payload.success === false) {
      const errorMsg = payload.error || "Failed to assess pronunciation (unknown error)";
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Validate that we have the required fields for a successful response
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

