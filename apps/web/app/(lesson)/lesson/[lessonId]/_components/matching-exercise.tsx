"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { cn, shuffleArray } from "@/lib/utils";
import { ExerciseOption } from "@/types";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { answerTileClass, keepEnterForCheck } from "./answer-tile";

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

export function MatchingExercise({ options, onSelect, status, disabled }: MatchingExerciseProps) {
  const { selectOptions } = useQuizStore();
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Map<string, boolean>>(new Map());
  const [lastMatchedPair, setLastMatchedPair] = useState<{
    leftId: number;
    rightId: number;
  } | null>(null);
  const [wrongMatch, setWrongMatch] = useState<{
    leftId: number;
    rightId: number;
  } | null>(null);
  // Which exercise (options array) completion was already reported for.
  const notifiedForRef = useRef<ExerciseOption[] | null>(null);

  // Reset state when options change (new exercise), during render.
  const [optionsForState, setOptionsForState] = useState(options);
  if (options !== optionsForState) {
    setOptionsForState(options);
    setMatches(new Map());
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongMatch(null);
    setLastMatchedPair(null);
  }

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
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(option.text);

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

  // While a wrong pair's red verdict is showing, the child must press Continue first;
  // a pair finished meanwhile would be ignored by the quiz and leave the exercise stuck.
  const isLocked = disabled || status === "wrong";

  const handleLeftClick = (optionId: number) => {
    if (isLocked) return;

    setSelectedLeft(optionId);
    setSelectedRight(null);

    // If we have a right selection, try to match
    if (selectedRight) {
      checkMatch(optionId, selectedRight);
    }
  };

  const handleRightClick = (optionId: number) => {
    if (isLocked) return;

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

      // Store the matched pair
      setLastMatchedPair({ leftId: leftId, rightId: rightId });

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

  // Notify parent when all matches are complete, but only once
  useEffect(() => {
    if (isAllMatched && matches.size > 0 && notifiedForRef.current !== options && lastMatchedPair) {
      notifiedForRef.current = options;
      // Use a small delay to ensure the last match animation completes
      setTimeout(() => {
        // Store both matched option IDs in the quiz store
        selectOptions(lastMatchedPair.leftId, lastMatchedPair.rightId);
        // Trigger completion state by selecting the left option
        onSelect(lastMatchedPair.leftId);
      }, 300);
    }
  }, [isAllMatched, matches.size, lastMatchedPair, options, onSelect, selectOptions]);

  const tileClass = (option: ExerciseOption, selected: boolean, wrong: boolean) =>
    cn(
      answerTileClass({
        selected: selected && !wrong,
        status: "none",
        matched: isMatched(option),
        wrong,
        disabled: isLocked || isMatched(option),
      }),
      "flex h-20 items-center justify-center px-3 text-center sm:h-24",
      isLocked && !isMatched(option) && !wrong && "opacity-50",
    );

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6">
      {/* Left Column (Vietnamese/Images) */}
      <div className="space-y-3">
        {leftOptions.map((option) => (
          <button
            type="button"
              onKeyDown={keepEnterForCheck}
            key={option.id}
            aria-pressed={selectedLeft === option.id}
            onClick={() => handleLeftClick(option.id)}
            className={tileClass(option, selectedLeft === option.id, wrongMatch?.leftId === option.id)}
          >
            {option.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={option.imageUrl}
                alt={option.text || "Hình để ghép"}
                className="max-h-14 max-w-full rounded-lg object-contain sm:max-h-16"
              />
            ) : (
              <span className="text-lg font-extrabold leading-snug sm:text-xl">{option.text}</span>
            )}
          </button>
        ))}
      </div>

      {/* Right Column (English) */}
      <div className="space-y-3">
        {rightOptions.map((option) => (
          <button
            type="button"
              onKeyDown={keepEnterForCheck}
            key={option.id}
            aria-pressed={selectedRight === option.id}
            onClick={() => handleRightClick(option.id)}
            className={tileClass(option, selectedRight === option.id, wrongMatch?.rightId === option.id)}
          >
            <span className="text-lg font-extrabold leading-snug sm:text-xl">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
