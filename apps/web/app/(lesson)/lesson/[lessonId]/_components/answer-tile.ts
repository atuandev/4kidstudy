import { cn } from "@/lib/utils";

type AnswerState = {
  /** The child picked this tile. */
  selected?: boolean;
  /** Result of the last check, for the selected tile. */
  status?: "correct" | "wrong" | "none";
  /** Matching: this tile is already paired (stays green, no lift). */
  matched?: boolean;
  /** Matching: this tile was part of a wrong pair. */
  wrong?: boolean;
  disabled?: boolean;
};

/**
 * One vocabulary for every answer tile in the lesson player: a white tile on a
 * slate ledge; sky when picked; a correct pick lifts off the page like a peeled
 * sticker in green; a wrong pick nudges sideways in red.
 */
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
    // Hover and press only while the tile has no verdict, so the result colour always shows.
    !disabled &&
      !matched &&
      !isCorrect &&
      !isWrong &&
      "hover:border-sky/70 hover:bg-sky-wash/50 active:translate-y-0.5 active:border-b-2",
    isPicked && "border-sky bg-sky-wash text-sky-ink hover:bg-sky-wash",
    matched && "cursor-default border-leaf bg-leaf-wash text-forest",
    isCorrect &&
      "-translate-y-1 border-leaf bg-leaf-wash text-forest shadow-[0_14px_22px_-12px_rgb(21_128_61/0.6)] motion-safe:-rotate-2",
    isWrong && "border-cherry bg-cherry-wash text-cherry-deep motion-safe:animate-[nudge_0.35s_ease-in-out]",
    disabled && "pointer-events-none",
  );
}

/** The small keyboard-number badge in a tile's corner. */
export function answerKeyClass({ selected, status }: AnswerState) {
  return cn(
    "flex size-7 items-center justify-center rounded-lg border-2 bg-white text-xs font-black tabular-nums",
    "border-edge text-ink-meta",
    selected && status === "none" && "border-sky text-sky-ink",
    selected && status === "correct" && "border-leaf text-forest",
    selected && status === "wrong" && "border-cherry text-cherry-deep",
  );
}

/**
 * Enter is the lesson's global "check / continue" key. Stop it from also
 * activating whichever button has focus, so one press never acts twice.
 * Space and clicks still activate the button.
 */
export function keepEnterForCheck(event: { key: string; preventDefault: () => void }) {
  if (event.key === "Enter") event.preventDefault();
}
