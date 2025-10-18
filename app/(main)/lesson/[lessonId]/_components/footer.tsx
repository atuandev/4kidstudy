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
  isAutoSkipExercise?: boolean;
  hintVi?: string;
  hintEn?: string;
};

export const Footer = ({
  onCheck,
  onSkip,
  status,
  disabled,
  lessonId,
  showSkip = true,
  isAutoSkipExercise = false,
  hintVi,
  hintEn,
}: FooterProps) => {
  useKey("Enter", onCheck, {}, [onCheck]);
  useKey("s", onSkip || (() => {}), {}, [onSkip]);
  const isMobile = useMedia("(max-width: 1024px)");

  return (
    <footer
      className={cn(
        "border-t-2 py-4",
        status === "correct" && "border-transparent bg-green-100",
        status === "wrong" && "border-transparent bg-rose-100"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between px-6 lg:px-10">
        <div className="flex flex-col gap-2 lg:gap-3">
          <div className="flex items-center gap-4">
            {status === "correct" && (
              <div className="flex items-center text-base font-bold text-green-500 lg:text-2xl">
                <CheckCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
                Rất tốt!
              </div>
            )}

            {status === "wrong" && (
              <div className="flex items-center text-base font-bold text-rose-500 lg:text-2xl">
                <XCircle className="mr-4 h-6 w-6 lg:h-10 lg:w-10" />
                {isAutoSkipExercise ? "Tiếp tục thôi!" : "Làm lại."}
              </div>
            )}

            {status === "completed" && (
              <Button
                variant="default"
                size={isMobile ? "sm" : "lg"}
                onClick={() => (window.location.href = `/lesson/${lessonId}`)}
              >
                Làm lại
              </Button>
            )}

            {/* Skip button - only show when in "none" state and skip is enabled */}
            {status === "none" && showSkip && onSkip && (
              <Button
                onClick={onSkip}
                variant="default"
                size={isMobile ? "sm" : "lg"}
                title="Skip this exercise (Press 'S')"
              >
                Bỏ qua
              </Button>
            )}
          </div>

          {/* Hints section - only show when wrong or correct */}
          {status === "correct" && (hintVi || hintEn) && (
            <div className="">
              {hintEn && (
                <div className="text-green-500 font-bold text-2xl">
                  {hintEn}
                </div>
              )}
              {hintVi && (
                <div className="text-green-500 font-semibold text-2xl">
                  {hintVi}
                </div>
              )}
            </div>
          )}
          {status === "wrong" && (hintVi || hintEn) && (
            <div className="">
              {hintEn && (
                <div className="text-rose-500 font-bold text-2xl">
                  {hintEn}
                </div>
              )}
              {hintVi && (
                <div className="text-rose-500 font-semibold text-2xl">
                  {hintVi}
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          disabled={disabled}
          aria-disabled={disabled}
          onClick={onCheck}
          size={isMobile ? "sm" : "lg"}
          variant={status === "wrong" ? "danger" : "secondary"}
        >
          {status === "none" && "Kiểm tra"}
          {status === "correct" && "Tiếp tục"}
          {status === "wrong" && (isAutoSkipExercise ? "Tiếp tục" : "Làm lại")}
          {status === "completed" && "Tiếp tục"}
        </Button>
      </div>
    </footer>
  );
};
