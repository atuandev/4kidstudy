"use client";

import { useState, useCallback, useMemo } from "react";
import { Shuffle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExerciseOption } from "@/types";

type ListeningExerciseProps = {
  options: ExerciseOption[];
  onSelect: (id: number) => void;
  status: "correct" | "wrong" | "none";
  selectedOption?: number;
  disabled?: boolean;
  targetText?: string;
  mode: "text_choice" | "sentence_reconstruction";
};

type WordCard = {
  id: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
  order?: number;
};

export function ListeningExercise({
  options,
  onSelect,
  status,
  selectedOption,
  disabled,
  targetText,
  mode,
}: ListeningExerciseProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<WordCard[]>([]);

  // Initialize word cards for sentence reconstruction
  const initializeWords = useCallback(() => {
    if (mode === "sentence_reconstruction" && targetText) {
      const correctWords = targetText.split(" ");
      const distractorWords = ["the", "a", "is", "are", "was", "very", "really"]; // Add some distractors
      
      const allWords = [
        ...correctWords.map((word, index) => ({
          id: `correct_${index}`,
          text: word,
          isCorrect: true,
          isSelected: false,
          order: index,
        })),
        // Add some distractors
        ...distractorWords.slice(0, Math.min(2, Math.floor(correctWords.length / 2))).map((word, index) => ({
          id: `distractor_${index}`,
          text: word,
          isCorrect: false,
          isSelected: false,
        })),
      ];

      // Shuffle the words
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      setAvailableWords(shuffled);
      setSelectedWords([]);
    }
  }, [mode, targetText]);

  // Initialize words on component mount
  useMemo(() => {
    if (mode === "sentence_reconstruction") {
      initializeWords();
    }
  }, [mode, initializeWords]);

  const handleWordClick = useCallback((wordId: string) => {
    if (disabled) return;

    const word = availableWords.find(w => w.id === wordId);
    if (!word) return;

    if (word.isSelected) {
      // Remove word from selected
      setSelectedWords(prev => prev.filter(id => id !== wordId));
      setAvailableWords(prev => prev.map(w => 
        w.id === wordId ? { ...w, isSelected: false } : w
      ));
    } else {
      // Add word to selected
      setSelectedWords(prev => [...prev, wordId]);
      setAvailableWords(prev => prev.map(w => 
        w.id === wordId ? { ...w, isSelected: true } : w
      ));
    }
  }, [availableWords, disabled]);

  const handleRemoveWord = useCallback((wordId: string, index: number) => {
    if (disabled) return;

    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => prev.map(w => 
      w.id === wordId ? { ...w, isSelected: false } : w
    ));
  }, [disabled]);

  const checkSentence = useCallback(() => {
    if (!targetText) return;

    const selectedWordsText = selectedWords
      .map(wordId => availableWords.find(w => w.id === wordId)?.text)
      .filter(Boolean)
      .join(" ");

    const isCorrect = selectedWordsText.toLowerCase().trim() === targetText.toLowerCase().trim();
    
    if (isCorrect) {
      onSelect(1); // Indicate correct answer
    } else {
      // Show error briefly
      setTimeout(() => {
        // Reset or allow retry
      }, 1000);
    }
  }, [selectedWords, availableWords, targetText, onSelect]);

  const resetSentence = useCallback(() => {
    initializeWords();
  }, [initializeWords]);

  if (mode === "text_choice") {
    // Standard multiple choice for listening
    return (
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, i) => (
          <div
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={cn(
              "p-4 rounded-xl border-2 border-b-4 cursor-pointer hover:bg-black/5 active:border-b-2",
              selectedOption === option.id && "border-sky-300 bg-sky-100 hover:bg-sky-100",
              selectedOption === option.id && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
              selectedOption === option.id && status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
              disabled && "pointer-events-none hover:bg-white"
            )}
          >
            <div className="text-center">
              <p className={cn(
                "text-sm font-medium text-neutral-600 lg:text-base",
                selectedOption === option.id && "text-sky-500",
                selectedOption === option.id && status === "correct" && "text-green-500",
                selectedOption === option.id && status === "wrong" && "text-rose-500"
              )}>
                {option.text}
              </p>
              <div className={cn(
                "mt-2 flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px] mx-auto",
                selectedOption === option.id && "border-sky-300 text-sky-500",
                selectedOption === option.id && status === "correct" && "border-green-500 text-green-500",
                selectedOption === option.id && status === "wrong" && "border-rose-500 text-rose-500"
              )}>
                {i + 1}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Sentence reconstruction mode
  return (
    <div className="space-y-6">
      {/* Selected words area */}
      <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] border-2 border-dashed border-gray-300">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Your sentence:</h3>
        <div className="flex flex-wrap gap-2 min-h-[40px] items-start">
          {selectedWords.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Tap words below to build your sentence</p>
          ) : (
            selectedWords.map((wordId, index) => {
              const word = availableWords.find(w => w.id === wordId);
              return (
                <button
                  key={`${wordId}_${index}`}
                  onClick={() => handleRemoveWord(wordId, index)}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  disabled={disabled}
                >
                  {word?.text}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Available words */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">Available words:</h3>
          <Button
            onClick={resetSentence}
            variant="secondaryOutline"
            size="sm"
            className="flex items-center gap-1"
            disabled={disabled}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word) => (
            <button
              key={word.id}
              onClick={() => handleWordClick(word.id)}
              disabled={disabled || word.isSelected}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors",
                word.isSelected 
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 cursor-pointer",
                disabled && "opacity-50"
              )}
            >
              {word.text}
            </button>
          ))}
        </div>
      </div>

      {/* Check button */}
      {selectedWords.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={checkSentence}
            disabled={disabled || selectedWords.length === 0}
            className="px-6"
          >
            Check Sentence
          </Button>
        </div>
      )}
    </div>
  );
}
