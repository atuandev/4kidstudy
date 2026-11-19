"use client";

import {} from "react";
import {} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExerciseOption } from "@/types";

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
    <div className="grid grid-cols-2 gap-2">
      {options.map((option, i) => (
        <div
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={cn(
            "p-6 rounded-xl border-2 border-b-4 cursor-pointer hover:bg-black/5 active:border-b-2",
            selectedOption === option.id &&
              "border-sky-300 bg-sky-100 hover:bg-sky-100",
            selectedOption === option.id &&
              status === "correct" &&
              "border-green-300 bg-green-100 hover:bg-green-100",
            selectedOption === option.id &&
              status === "wrong" &&
              "border-rose-300 bg-rose-100 hover:bg-rose-100",
            disabled && "pointer-events-none hover:bg-white"
          )}
        >
          <div className="text-center">
            <p
              className={cn(
                "font-semibold text-neutral-600 text-xl",
                selectedOption === option.id && "text-sky-500",
                selectedOption === option.id &&
                  status === "correct" &&
                  "text-green-500",
                selectedOption === option.id &&
                  status === "wrong" &&
                  "text-rose-500"
              )}
            >
              {option.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
