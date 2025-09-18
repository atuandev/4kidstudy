import { CheckCircle, XCircle, SkipForward } from "lucide-react";
import { useKey, useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterProps = {
  onCheck: () => void;
  onSkip?: () => void;
  status: "correct" | "wrong" | "none" | "completed";
  disabled?: boolean;
  lessonId?: number;
  showSkip?: boolean;
};

export const Footer = ({
  onCheck,
  onSkip,
  status,
  disabled,
  lessonId,
  showSkip = true,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  useKey("s", onSkip || (() => {}), {}, [onSkip]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "h-[100px] border-t-2 lg:h-[140px]",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-4">
          {status === "correct" && (
            <div className="flex items-center text-base font-bold text-green-500 lg:text-2xl">
              <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
              Nicely done!
            </div>
          )}

          {status === "wrong" && (
            <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
              <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
              Try again.
            </div>
          )}

          {status === "completed" && (
            <Button
              variant="default"
              size={isMobile ? "sm" : "lg"}
              onClick={() => (window.location.href = `/lesson/${lessonId}`)}
            >
              Practice again
            </Button>
          )}

          {/* Skip button - only show when in "none" state and skip is enabled */}
          {status === "none" && showSkip && onSkip && (
            <Button
              onClick={onSkip}
              variant="secondaryOutline"
              size={isMobile ? "sm" : "lg"}
              className="text-neutral-500 hover:text-neutral-700"
              title="Skip this exercise (Press 'S')"
            >
              Skip
            </Button>
          )}
        </div>

        <Button
          disabled={disabled}
          aria-disabled={disabled}
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Check"}
          {status === "correct" && "Next"}
          {status === "wrong" && "Retry"}
          {status === "completed" && "Continue"}
        </Button>
      </div>
    </footer>
  );
};
