import { AudioLines, Check, Mic, RotateCcw, Square, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoundButton } from "./round-button";

export type RecordingState = "idle" | "recording" | "recorded" | "analyzing" | "completed";

interface RecorderControlsProps {
  readonly state: RecordingState;
  readonly score: number | null;
  readonly passed: boolean;
  readonly progress: number;
  readonly errorMessage?: string | null;
  readonly canAnalyze?: boolean;
  readonly className?: string;
  readonly onStart: (event: React.MouseEvent) => void;
  readonly onStop: (event: React.MouseEvent) => void;
  readonly onPlayback: (event: React.MouseEvent) => void;
  readonly onAnalyze: (event: React.MouseEvent) => void;
  readonly onReset: (event: React.MouseEvent) => void;
  /** Swallows clicks on non-button areas (the flashcard flips on click). */
  readonly onSurfaceClick?: (event: React.MouseEvent) => void;
}

/** Record → listen back → score, in the lesson's vocabulary (cherry mic, leaf/cherry verdict). */
export function RecorderControls({
  state,
  score,
  passed,
  progress,
  errorMessage,
  canAnalyze = true,
  className,
  onStart,
  onStop,
  onPlayback,
  onAnalyze,
  onReset,
  onSurfaceClick,
}: RecorderControlsProps) {
  return (
    <div
      className={cn("flex min-h-14 flex-wrap items-center gap-2.5", className)}
      onClick={onSurfaceClick}
    >
      {state === "idle" ? (
        <>
          <RoundButton tone="cherry" size="lg" aria-label="Ghi âm giọng đọc" onClick={onStart}>
            <Mic aria-hidden="true" />
          </RoundButton>
          {errorMessage ? (
            <p role="alert" className="max-w-56 text-sm font-bold text-cherry-deep">
              {errorMessage}
            </p>
          ) : null}
        </>
      ) : null}

      {state === "recording" ? (
        <>
          <RoundButton tone="cherry" size="lg" aria-label="Dừng ghi âm" onClick={onStop}>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-cherry/40 motion-safe:animate-ping"
            />
            <Square aria-hidden="true" className="relative fill-white" />
          </RoundButton>
          <p role="status" className="text-base font-black text-cherry-deep">
            Đang ghi âm…
          </p>
        </>
      ) : null}

      {state === "recorded" ? (
        <>
          <RoundButton tone="wash" aria-label="Nghe lại giọng của bé" onClick={onPlayback}>
            <AudioLines aria-hidden="true" />
          </RoundButton>
          <Button variant="primary" onClick={onAnalyze} disabled={!canAnalyze}>
            Chấm điểm
          </Button>
          <RoundButton tone="wash" aria-label="Ghi âm lại" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
          </RoundButton>
          {errorMessage ? (
            <p role="alert" className="basis-full text-sm font-bold text-cherry-deep">
              {errorMessage}
            </p>
          ) : null}
        </>
      ) : null}

      {state === "analyzing" ? (
        <div role="status" className="flex min-w-56 flex-1 flex-col gap-1.5">
          <span className="text-sm font-black text-sky-ink">Đang chấm điểm…</span>
          <span className="block h-3 overflow-hidden rounded-full bg-wash" aria-hidden="true">
            <span
              className="block h-full rounded-full bg-sky transition-[width] duration-200 ease-peel"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </span>
        </div>
      ) : null}

      {state === "completed" && score !== null ? (
        <>
          <p
            role="status"
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full px-3.5 text-base font-black",
              passed ? "bg-leaf-wash text-forest" : "bg-cherry-wash text-cherry-deep",
            )}
          >
            {passed ? (
              <Check aria-hidden="true" className="size-5" strokeWidth={3} />
            ) : (
              <X aria-hidden="true" className="size-5" strokeWidth={3} />
            )}
            {Math.round(score)}%
            <span className="font-extrabold">· {passed ? "Đạt" : "Chưa đạt"}</span>
          </p>
          <RoundButton tone="wash" aria-label="Nghe lại giọng của bé" onClick={onPlayback}>
            <AudioLines aria-hidden="true" />
          </RoundButton>
          <RoundButton tone="wash" aria-label="Ghi âm lại" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
          </RoundButton>
        </>
      ) : null}
    </div>
  );
}
