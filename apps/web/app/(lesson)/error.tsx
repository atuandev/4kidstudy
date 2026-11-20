"use client";

import { useEffect } from "react";

import { ErrorSheet } from "@/components/error-sheet";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Main layout error:", error);
  }, [error]);

  return <ErrorSheet error={error} reset={reset} homeHref="/learn/units" className="min-h-dvh" />;
}
