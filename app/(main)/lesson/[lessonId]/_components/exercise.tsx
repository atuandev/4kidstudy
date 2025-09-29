import { cn } from "@/lib/utils";

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
  onPronunciationStateChange?: (state: string, score?: any) => void;
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
  // Use original options order to prevent hydration mismatch
  // Options order should be consistent between server and client
  const exerciseOptions = options;
  // Handle specialized exercise types
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
        prompt={prompt}
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
    // Determine mode based on whether we have targetText (sentence reconstruction) or just options (text choice)
    const mode = targetText && targetText.split(" ").length > 1 
      ? "sentence_reconstruction" 
      : "text_choice";
    
    return (
      <ListeningExercise
        options={options}
        onSelect={onSelect}
        status={status}
        selectedOption={selectedOption}
        disabled={disabled}
        targetText={targetText}
        mode={mode}
      />
    );
  }

  // Handle standard exercise types with cards (SELECT_IMAGE only)
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
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
