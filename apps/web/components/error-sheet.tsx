"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorSheetProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
  /** What failed to load, in plain Vietnamese. */
  readonly description?: string;
  /** Where "Trang chủ" goes; omitted hides the button. */
  readonly homeHref?: string;
  readonly className?: string;
}

/** The error-boundary sheet: mascot, what happened, try again. */
export function ErrorSheet({
  error,
  reset,
  description = "Đã xảy ra lỗi khi tải trang. Vui lòng thử lại.",
  homeHref,
  className,
}: ErrorSheetProps) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center p-4", className)}>
      <div
        role="alert"
        className="flex w-full max-w-md flex-col items-center rounded-[28px] bg-white px-6 py-10 text-center shadow-sheet-lime"
      >
        <Image src="/mascot.svg" alt="" width={72} height={72} className="-rotate-6" />
        <h1 className="mt-4 text-2xl font-black text-ink">Có lỗi xảy ra</h1>
        <p className="mt-1 text-base font-extrabold text-sky-ink">Something went wrong.</p>
        <p className="mt-3 text-base text-ink-body">{description}</p>
        {error.message ? (
          <p className="mt-3 w-full break-words rounded-2xl bg-wash px-4 py-2.5 text-sm font-semibold text-ink-body">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Button variant="secondary" size="lg" onClick={reset} className="flex-1">
            Thử lại
          </Button>
          {homeHref ? (
            <Button asChild size="lg" className="flex-1">
              <Link href={homeHref}>Trang chủ</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
