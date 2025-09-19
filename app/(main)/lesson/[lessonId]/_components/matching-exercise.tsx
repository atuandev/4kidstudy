"use client";

import { useState, useMemo, useEffect } from "react";
import { cn, shuffleArray } from "@/lib/utils";
import { ExerciseOption } from "@/types";

type MatchingExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
};

type MatchPair = {
  left: ExerciseOption;
  right: ExerciseOption;
  matchKey: string;
};

export function MatchingExercise({
  options,
  onSelect,
  status,
  disabled,
}: MatchingExerciseProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<string, boolean>>(new Map());
  const [wrongMatch, setWrongMatch] = useState<{
    leftId: number;
    rightId: number;
  } | null>(null);


  // Group options by matchKey to create pairs
  const { leftOptions, rightOptions, pairs } = useMemo(() => {
    const pairMap = new Map<string, MatchPair>();
    const leftOpts: ExerciseOption[] = [];
    const rightOpts: ExerciseOption[] = [];

    options.forEach((option) => {
      if (!option.matchKey) return;

      if (!pairMap.has(option.matchKey)) {
        pairMap.set(option.matchKey, {
          left: option,
          right: option,
          matchKey: option.matchKey,
        });
      } else {
        const pair = pairMap.get(option.matchKey)!;
        if (pair.left === option) {
          pairMap.set(option.matchKey, {
            ...pair,
            right: option,
          });
        } else {
          pairMap.set(option.matchKey, {
            ...pair,
            left: option,
          });
        }
      }
    });

    // Separate into left (Vietnamese/Images) and right (English) columns
    options.forEach((option) => {
      const hasImage = !!option.imageUrl;
      const isVietnamese =
        option.text &&
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(
          option.text
        );
      
      // Left column: Options with images OR Vietnamese text
      if (hasImage || isVietnamese) {
        leftOpts.push(option);
      } else {
        // Right column: English text
        rightOpts.push(option);
      }
    });

    // If we don't have items in both columns, distribute evenly
    if (leftOpts.length === 0 || rightOpts.length === 0) {
      const allOpts = [...options];
      leftOpts.length = 0;
      rightOpts.length = 0;
      
      allOpts.forEach((option, index) => {
        if (index % 2 === 0) {
          leftOpts.push(option);
        } else {
          rightOpts.push(option);
        }
      });
    }

    // Shuffle both columns to randomize option order
    return {
      leftOptions: shuffleArray(leftOpts),
      rightOptions: shuffleArray(rightOpts),
      pairs: Array.from(pairMap.values()),
    };
  }, [options]);

  const handleLeftClick = (optionId: number) => {
    if (disabled) return;

    setSelectedLeft(optionId);
    setSelectedRight(null);

    // If we have a right selection, try to match
    if (selectedRight) {
      checkMatch(optionId, selectedRight);
    }
  };

  const handleRightClick = (optionId: number) => {
    if (disabled) return;

    setSelectedRight(optionId);
    setSelectedLeft(null);

    // If we have a left selection, try to match
    if (selectedLeft) {
      checkMatch(selectedLeft, optionId);
    }
  };

  const checkMatch = (leftId: number, rightId: number) => {
    const leftOption = options.find((opt) => opt.id === leftId);
    const rightOption = options.find((opt) => opt.id === rightId);

    if (!leftOption || !rightOption) return;

    // Check if they have the same matchKey
    const isCorrectMatch = leftOption.matchKey === rightOption.matchKey;

    if (isCorrectMatch) {
      // Add to matches
      setMatches((prev) => new Map(prev.set(leftOption.matchKey!, true)));

      // Clear selections
      setSelectedLeft(null);
      setSelectedRight(null);

      // Clear any previous wrong match state
      setWrongMatch(null);
    } else {
      // Wrong match, show error briefly then clear
      setWrongMatch({ leftId, rightId });

      // Trigger parent component's wrong state to play incorrect audio
      onSelect(-1); // Use -1 to indicate wrong match

      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongMatch(null);
      }, 1000);
    }
  };

  const isMatched = (option: ExerciseOption) => {
    return option.matchKey ? matches.has(option.matchKey) : false;
  };

  const isAllMatched = matches.size === pairs.length;

  // Notify parent when all matches are complete, but don't auto-advance
  useEffect(() => {
    if (isAllMatched && matches.size > 0) {
      // Trigger completion state by selecting any valid option
      const firstOption = options.find((opt) => opt.id > 0);
      if (firstOption) {
        onSelect(firstOption.id);
      }
    }
  }, [isAllMatched, matches.size, options, onSelect]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Left Column (Vietnamese/Images) */}
      <div className="space-y-3">
        {leftOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleLeftClick(option.id)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 h-24 flex items-center justify-center",
              selectedLeft === option.id && "border-blue-300 bg-blue-100",
              isMatched(option) &&
                "border-green-300 bg-green-100 cursor-default",
              wrongMatch?.leftId === option.id && "border-red-300 bg-red-100",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            {option.imageUrl ? (
              <img
                src={option.imageUrl}
                alt={option.text || "Exercise image"}
                className="max-w-full max-h-16 object-contain rounded"
              />
            ) : (
              <p
                className={cn(
                  "text-sm font-medium lg:text-base text-center",
                  selectedLeft === option.id && "text-blue-600",
                  isMatched(option) && "text-green-600",
                  wrongMatch?.leftId === option.id && "text-red-600"
                )}
              >
                {option.text}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Right Column (English) */}
      <div className="space-y-3">
        {rightOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleRightClick(option.id)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50 h-24 flex items-center justify-center",
              selectedRight === option.id && "border-blue-300 bg-blue-100",
              isMatched(option) &&
                "border-green-300 bg-green-100 cursor-default",
              wrongMatch?.rightId === option.id && "border-red-300 bg-red-100",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <p
              className={cn(
                "text-sm font-medium lg:text-base text-center",
                selectedRight === option.id && "text-blue-600",
                isMatched(option) && "text-green-600",
                wrongMatch?.rightId === option.id && "text-red-600"
              )}
            >
              {option.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
