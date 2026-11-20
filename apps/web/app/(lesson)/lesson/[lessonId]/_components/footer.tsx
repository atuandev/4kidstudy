import { CheckIcon, XIcon } from "@/components/icons";
import { useKey } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { keepEnterForCheck } from "./answer-tile";

type FooterProps = {
  onCheck: () => void;
  onSkip?: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  showSkip?: boolean;
  isAutoSkipExercise?: boolean;
  hintVi?: string;
  hintEn?: string;
  isFirstWrongAttempt?: boolean;
};

/**
 * The lesson's bottom sheet. It turns green or red after a check, with the
 * verdict and the hint rising into it, and always holds the one next action.
 */
export const Footer = ({
  onCheck,
  onSkip,
  status,
  disabled,
  lessonId,
  hintVi,
  hintEn,
  isFirstWrongAttempt,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  useKey("s", onSkip || (() => {}), {}, [onSkip]);

  const isCorrect = status === "correct";
  const isWrong = status === "wrong";
  const hasHint = (isCorrect || isWrong) && (hintVi || hintEn);

  return (
    <footer
      className={cn(
        "sticky bottom-0 z-40 border-t-2 transition-colors duration-200",
        isCorrect && "border-leaf bg-leaf-wash",
        isWrong && "border-cherry bg-cherry-wash",
        !isCorrect && !isWrong && "border-lime-rule bg-white",
      )}
    >
      <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-4 py-4 sm:min-h-[120px] sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
        <div aria-live="polite" className="min-w-0">
          {(isCorrect || isWrong) && (
            <div
              key={status}
              className="flex items-start gap-4 motion-safe:animate-[rise_0.3s_var(--ease-peel)]"
            >
              <span
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full bg-white sm:size-14",
                  isCorrect ? "text-leaf-deep" : "text-cherry",
                )}
                aria-hidden="true"
              >
                {isCorrect ? (
                  <CheckIcon className="size-7 sm:size-8" />
                ) : (
                  <XIcon className="size-7 sm:size-8" />
                )}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-2xl font-black leading-tight",
                    isCorrect ? "text-forest" : "text-cherry-deep",
                  )}
                >
                  {isCorrect ? "Rất tốt!" : isFirstWrongAttempt ? "Làm lại!" : "Tiếp tục thôi!"}
                </p>
                {hasHint ? (
                  <div className={cn("mt-1", isCorrect ? "text-forest" : "text-cherry-deep")}>
                    {hintEn && <p className="text-lg font-extrabold">{hintEn}</p>}
                    {hintVi && <p className="text-base">{hintVi}</p>}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {status === "none" && (
            <p className="hidden text-sm font-bold text-ink-meta sm:block">
              Chọn đáp án rồi bấm{" "}
              <kbd className="rounded-md border-2 border-b-4 border-edge bg-white px-1.5 font-sans text-xs font-black text-ink-body">
                Enter
              </kbd>{" "}
              để kiểm tra.
            </p>
          )}

          {status === "completed" && (
            <Button
              variant="default"
              size="lg"
              className="h-14 w-full text-base sm:w-auto sm:min-w-[160px]"
              onClick={() => (window.location.href = `/lesson/${lessonId}`)}
            >
              Làm lại
            </Button>
          )}
        </div>

        <Button
          disabled={disabled}
          aria-disabled={disabled}
          onClick={onCheck}
          onKeyDown={keepEnterForCheck}
          size="lg"
          variant={isWrong ? "danger" : "secondary"}
          className="h-14 w-full shrink-0 text-base uppercase tracking-wide sm:w-auto sm:min-w-[220px]"
        >
          {status === "none" ? "Kiểm tra" : "Tiếp tục"}
        </Button>
      </div>
    </footer>
  );
};
