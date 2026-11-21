"use client";

import { useMemo } from "react";
import { useIsClient } from "@/hooks/use-is-client";
import { cn, isValidUrl, shuffleArray } from "@/lib/utils";
import Image from "next/image";
import { ExerciseOption } from "@/types";
import { answerTileClass, keepEnterForCheck } from "./answer-tile";

type MultipleChoiceExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  imageUrl?: string;
};

export function MultipleChoiceExercise({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  imageUrl,
}: MultipleChoiceExerciseProps) {
  const isClient = useIsClient();
  const shuffledOptions = useMemo(
    () => (isClient ? shuffleArray(options) : options),
    [isClient, options],
  );

  return (
    <div className="space-y-6">
      {isValidUrl(imageUrl) && (
        <div className="flex justify-center">
          <div className="relative aspect-square w-full max-w-[180px] -rotate-2 overflow-hidden rounded-[24px] border-[6px] border-white bg-white shadow-sticker sm:max-w-[210px]">
            <Image
              src={imageUrl!}
              fill
              alt="Hình của câu hỏi"
              sizes="210px"
              className="object-contain"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {shuffledOptions.map((option) => {
          const selected = selectedOption === option.id;
          return (
            <button
              type="button"
              onKeyDown={keepEnterForCheck}
              key={option.id}
              aria-pressed={selected}
              onClick={() => !disabled && onSelect(option.id)}
              className={cn(
                answerTileClass({ selected, status, disabled }),
                "flex h-full min-h-[72px] flex-col items-center justify-center gap-3 px-5 py-4 text-center",
              )}
            >
              {isValidUrl(option.imageUrl) && (
                <span className="relative block aspect-square w-full max-w-[120px] overflow-hidden rounded-[14px] bg-white">
                  <Image
                    src={option.imageUrl!}
                    fill
                    alt={option.text || ""}
                    sizes="120px"
                    className="object-contain"
                  />
                </span>
              )}
              <span className="text-xl font-extrabold leading-snug">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
