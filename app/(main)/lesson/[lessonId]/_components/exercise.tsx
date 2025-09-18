import { cn } from "@/lib/utils";

import { Card } from "./card";
import { ExerciseOption, ExerciseType } from "@/types";

type ExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: ExerciseType;
};

export const Exercise = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
}: ExerciseProps) => {
  return (
    <div
      className={cn(
        "grid gap-2",
        type === "SELECT_IMAGE" &&
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
        type === "MULTIPLE_CHOICE" &&
          "grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
        type === "MATCHING" &&
          "grid-cols-2",
        type === "LISTENING" &&
          "grid-cols-2",
        type === "PRONUNCIATION" &&
          "grid-cols-1"
      )}
    >
      {options.map((option, i) => (
        <Card
          key={option.id}
          id={option.id}
          text={option.text || ""}
          imageSrc={option.imageUrl || null}
          shortcut={`${i + 1}`}
          selected={selectedOption === option.id}
          onClick={() => onSelect(option.id)}
          status={status}
          audioSrc={option.audioUrl || null}
          disabled={disabled}
          type={type}
        />
      ))}
    </div>
  );
};
