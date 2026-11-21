import type { PronunciationScore } from "@/lib/stores/quiz-store";
import { Card } from "./card";
import { MatchingExercise } from "./matching-exercise";
import { PronunciationExercise } from "./pronunciation-exercise";
import { ListeningExercise } from "./listening-exercise";
import { MultipleChoiceExercise } from "./multiple-choice-exercise";
import { ExerciseOption, ExerciseType } from "@/types";

type ExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  type: ExerciseType;
  targetText?: string;
  audioUrl?: string;
  imageUrl?: string;
  prompt?: string;
  onPronunciationStateChange?: (state: string, score?: PronunciationScore | null) => void;
};

export const Exercise = ({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  type,
  targetText,
  audioUrl,
  imageUrl,
  prompt,
  onPronunciationStateChange,
}: ExerciseProps) => {
  const exerciseOptions = options;
  if (type === "MATCHING") {
    return (
      <MatchingExercise
        options={options}
        onSelect={onSelect}
        status={status}
        selectedOption={selectedOption}
        disabled={disabled}
      />
    );
  }

  if (type === "MULTIPLE_CHOICE") {
    return (
      <MultipleChoiceExercise
        options={options}
        onSelect={onSelect}
        status={status}
        selectedOption={selectedOption}
        disabled={disabled}
        imageUrl={imageUrl}
      />
    );
  }

  if (type === "PRONUNCIATION") {
    return (
      <PronunciationExercise
        options={options}
        onSelect={onSelect}
        status={status}
        selectedOption={selectedOption}
        disabled={disabled}
        targetText={targetText}
        audioUrl={audioUrl}
        onStateChange={onPronunciationStateChange}
      />
    );
  }

  if (type === "LISTENING") {
    return (
      <ListeningExercise
        options={options}
        onSelect={onSelect}
        status={status}
        selectedOption={selectedOption}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))] sm:gap-4">
      {exerciseOptions.map((option, i) => (
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
          matchKey={option.matchKey}
        />
      ))}
    </div>
  );
};
