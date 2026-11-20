"use server";

import { cookies } from "next/headers";

/** Cookie holding the API's password-reset token between OTP and new-password steps. */
const PASSWORD_RESET_COOKIE = "passwordResetToken";

export const setPasswordResetToken = async (token: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set({
    name: PASSWORD_RESET_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 10 * 60, // matches the API token lifetime
  });
};

export const getPasswordResetToken = async (): Promise<string | undefined> => {
  const cookiesStore = await cookies();
  return cookiesStore.get(PASSWORD_RESET_COOKIE)?.value;
};

export const clearPasswordResetToken = async () => {
  const cookiesStore = await cookies();
  cookiesStore.delete(PASSWORD_RESET_COOKIE);
};

export const setTokenToCookies = async (accessToken: string, refreshToken: string) => {
  const cookiesStore = await cookies();

  cookiesStore.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  cookiesStore.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
};
