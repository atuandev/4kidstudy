"use client";

import { useEffect } from "react";

import { ErrorSheet } from "@/components/error-sheet";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Profile page error:", error);
  }, [error]);

  return (
    <ErrorSheet
      error={error}
      reset={reset}
      description="Không thể tải thông tin hồ sơ. Vui lòng thử lại."
    />
  );
}
