"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
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

    // Separate into left (Vietnamese) and right (English) columns
    // Assuming Vietnamese text contains Vietnamese characters or is longer
    options.forEach((option) => {
      const isVietnamese = option.text && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(option.text);
      if (isVietnamese) {
        leftOpts.push(option);
      } else {
        rightOpts.push(option);
      }
    });

    // If no Vietnamese characters detected, use order to determine sides
    if (leftOpts.length === 0 && rightOpts.length === 0) {
      options.forEach((option, index) => {
        if (index % 2 === 0) {
          leftOpts.push(option);
        } else {
          rightOpts.push(option);
        }
      });
    }

    return {
      leftOptions: leftOpts,
      rightOptions: rightOpts,
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

      // Notify parent component
      onSelect(leftId); // or rightId, doesn't matter for matching
    } else {
      // Wrong match, show error briefly then clear
      setTimeout(() => {
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  const isMatched = (option: ExerciseOption) => {
    return option.matchKey ? matches.has(option.matchKey) : false;
  };

  const isAllMatched = matches.size === pairs.length;

  // Auto-complete the exercise when all pairs are matched
  if (isAllMatched && status === "none") {
    setTimeout(() => onSelect(0), 100); // Trigger completion
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column (Vietnamese) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          Tiếng Việt
        </h3>
        {leftOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleLeftClick(option.id)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50",
              selectedLeft === option.id && "border-blue-300 bg-blue-100",
              isMatched(option) && "border-green-300 bg-green-100 cursor-default",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <p className={cn(
              "text-sm font-medium lg:text-base",
              selectedLeft === option.id && "text-blue-600",
              isMatched(option) && "text-green-600"
            )}>
              {option.text}
            </p>
          </div>
        ))}
      </div>

      {/* Right Column (English) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          English
        </h3>
        {rightOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleRightClick(option.id)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-blue-50",
              selectedRight === option.id && "border-blue-300 bg-blue-100",
              isMatched(option) && "border-green-300 bg-green-100 cursor-default",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <p className={cn(
              "text-sm font-medium lg:text-base",
              selectedRight === option.id && "text-blue-600",
              isMatched(option) && "text-green-600"
            )}>
              {option.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
