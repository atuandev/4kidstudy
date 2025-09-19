"use client";

import { useMemo } from "react";
import { cn, isValidUrl, shuffleArray } from "@/lib/utils";
import Image from "next/image";
import { ExerciseOption } from "@/types";

type MultipleChoiceExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  imageUrl?: string;
  prompt?: string;
};


export function MultipleChoiceExercise({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  imageUrl,
  prompt,
}: MultipleChoiceExerciseProps) {
  // Detect if this is a fill-in-the-blank exercise
  const isFillInTheBlank = prompt && prompt.includes("____");

  // Shuffle options to randomize display order
  const shuffledOptions = useMemo(() => shuffleArray(options), [options]);

  return (
    <div className="space-y-6">
      {/* Main Image (for image-to-text format) */}
      {isValidUrl(imageUrl) && (
        <div className="flex justify-center">
          <div className="relative aspect-square max-h-[200px] w-full max-w-[300px] lg:max-h-[300px]">
            <Image 
              src={imageUrl!} 
              fill 
              alt="Exercise image" 
              className="rounded-lg object-fill"
            />
          </div>
        </div>
      )}

      {/* Fill-in-the-blank sentence display */}
      {isFillInTheBlank && prompt && (
        <div className="text-center">
          <p className="text-lg font-medium text-neutral-700 lg:text-xl">
            {prompt.replace("____", "_______")}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Choose the correct word to fill in the blank
          </p>
        </div>
      )}

      {/* Answer Options Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
        {shuffledOptions.map((option, i) => (
          <div
            key={option.id}
            onClick={() => !disabled && onSelect(option.id)}
            className={cn(
              "h-full cursor-pointer rounded-xl border-2 border-b-4 p-4 hover:bg-black/5 active:border-b-2 lg:p-6",
              !disabled && "cursor-pointer",
              selectedOption === option.id && "border-sky-300 bg-sky-100 hover:bg-sky-100",
              selectedOption === option.id && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
              selectedOption === option.id && status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
              disabled && "pointer-events-none hover:bg-white"
            )}
          >
            <div>
              {/* Option Image (if provided) */}
              {isValidUrl(option.imageUrl) && (
                <div className="relative mb-4 aspect-square max-h-[80px] w-full lg:max-h-[120px]">
                  <Image 
                    src={option.imageUrl!} 
                    fill 
                    alt={option.text || ""} 
                    className="rounded-lg object-fill" 
                  />
                </div>
              )}

              {/* Option Text and Number */}
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-sm text-neutral-600 lg:text-base",
                  isFillInTheBlank && "font-medium text-center flex-1",
                  selectedOption === option.id && "text-sky-500",
                  selectedOption === option.id && status === "correct" && "text-green-500",
                  selectedOption === option.id && status === "wrong" && "text-rose-500"
                )}>
                  {option.text}
                </p>

                {!isFillInTheBlank && (
                  <div className={cn(
                    "flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
                    selectedOption === option.id && "border-sky-300 text-sky-500",
                    selectedOption === option.id && status === "correct" && "border-green-500 text-green-500",
                    selectedOption === option.id && status === "wrong" && "border-rose-500 text-rose-500"
                  )}>
                    {i + 1}
                  </div>
                )}
              </div>

              {/* For fill-in-the-blank, show the number below */}
              {isFillInTheBlank && (
                <div className="mt-2 flex justify-center">
                  <div className={cn(
                    "flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
                    selectedOption === option.id && "border-sky-300 text-sky-500",
                    selectedOption === option.id && status === "correct" && "border-green-500 text-green-500",
                    selectedOption === option.id && status === "wrong" && "border-rose-500 text-rose-500"
                  )}>
                    {i + 1}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
