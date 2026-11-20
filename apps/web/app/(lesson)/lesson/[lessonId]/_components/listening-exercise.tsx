"use client";

import { cn } from "@/lib/utils";
import { ExerciseOption } from "@/types";
import { answerTileClass, keepEnterForCheck } from "./answer-tile";

type ListeningExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
};

export function ListeningExercise({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
}: ListeningExerciseProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((option) => {
        const selected = selectedOption === option.id;
        return (
          <button
            type="button"
            onKeyDown={keepEnterForCheck}
            key={option.id}
            aria-pressed={selected}
            onClick={() => onSelect(option.id)}
            className={cn(
              answerTileClass({ selected, status, disabled }),
              "min-h-[80px] px-4 py-5 text-center text-xl font-extrabold leading-snug",
            )}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}
