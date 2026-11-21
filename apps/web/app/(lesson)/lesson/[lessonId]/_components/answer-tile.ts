import { cn } from "@/lib/utils";

type AnswerState = {
  selected?: boolean;
  status?: "correct" | "wrong" | "none";
  matched?: boolean;
  wrong?: boolean;
  disabled?: boolean;
};

export function answerTileClass({ selected, status, matched, wrong, disabled }: AnswerState) {
  const isCorrect = selected && status === "correct";
  const isWrong = wrong || (selected && status === "wrong");
  const isPicked = selected && !isCorrect && !isWrong;

  return cn(
    "relative w-full rounded-[20px] border-2 border-b-4 bg-white text-ink outline-none",
    "transition-[background-color,border-color,translate,rotate,box-shadow] duration-200 ease-peel",
    "focus-visible:ring-4 focus-visible:ring-sky/50",
    !isPicked && !isCorrect && !isWrong && !matched && "border-edge",
    !disabled && !matched && "cursor-pointer",
    !disabled &&
      !matched &&
      !isCorrect &&
      !isWrong &&
      "hover:border-sky/70 hover:bg-sky-wash/50 active:translate-y-0.5 active:border-b-2",
    isPicked && "border-sky bg-sky-wash text-sky-ink hover:bg-sky-wash",
    matched && "cursor-default border-leaf bg-leaf-wash text-forest",
    isCorrect &&
      "-translate-y-1 border-leaf bg-leaf-wash text-forest shadow-[0_14px_22px_-12px_rgb(21_128_61/0.6)] motion-safe:-rotate-2",
    isWrong &&
      "border-cherry bg-cherry-wash text-cherry-deep motion-safe:animate-[nudge_0.35s_ease-in-out]",
    disabled && "pointer-events-none",
  );
}

export function answerKeyClass({ selected, status }: AnswerState) {
  return cn(
    "flex size-7 items-center justify-center rounded-lg border-2 bg-white text-xs font-black tabular-nums",
    "border-edge text-ink-meta",
    selected && status === "none" && "border-sky text-sky-ink",
    selected && status === "correct" && "border-leaf text-forest",
    selected && status === "wrong" && "border-cherry text-cherry-deep",
  );
}

export function keepEnterForCheck(event: { key: string; preventDefault: () => void }) {
  if (event.key === "Enter") event.preventDefault();
}
