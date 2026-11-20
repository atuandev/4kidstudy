"use server";

import http from "@/lib/http";
import { setPasswordResetToken } from "@/lib/cookies";
import { VerifyEmailSchemaType } from "@/schemas/auth";

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  resetToken?: string;
}

export async function sendEmailOTP(email: string): Promise<VerifyOtpResponse> {
  const { payload } = await http.post<VerifyOtpResponse>(
    "/email/send-otp",
    JSON.stringify({ email }),
    {
      noAuth: true,
    }
  );

  return payload;
}

export async function verifyOTP(
  data: VerifyEmailSchemaType
): Promise<VerifyOtpResponse> {
  const { payload } = await http.post<VerifyOtpResponse>(
    "/email/verify-otp",
    JSON.stringify({ email: data.email, code: data.otp }),
    {
      noAuth: true,
    }
  );

  // Keep the reset token server-side (httpOnly cookie) for the new-password step.
  const { resetToken, ...result } = payload;
  if (resetToken) await setPasswordResetToken(resetToken);
  return result;
}
