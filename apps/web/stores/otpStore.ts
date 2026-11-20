"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OtpState {
  email: string | null;
  setEmail: (email: string) => void;
  clearEmail: () => void;
}

/**
 * Stores the email used in the OTP verification flows (register, forget password).
 */
export const useOtpStore = create<OtpState>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email: string) => {
        set({ email });
      },
      clearEmail: () => {
        set({ email: null });
      },
    }),
    {
      name: "otp-store",
      partialize: (state) => ({
        email: state.email,
      }),
    },
  ),
);
