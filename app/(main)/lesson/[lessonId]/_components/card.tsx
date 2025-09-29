import { useCallback } from "react";

import Image from "next/image";
import { useAudio, useKey } from "react-use";
import { Volume2, Mic } from "lucide-react";

import { ExerciseType } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CardProps = {
  id: number;
  text: string;
  imageSrc: string | null;
  audioSrc: string | null;
  shortcut: string;
  selected?: boolean;
  onClick: () => void;
  status?: "correct" | "wrong" | "none";
  disabled?: boolean;
  type: ExerciseType;
  matchKey?: string;
  isMatched?: boolean;
};

export const Card = ({
  text,
  imageSrc,
  audioSrc,
  shortcut,
  selected,
  onClick,
  status,
  disabled,
  type,
  matchKey,
  isMatched,
}: CardProps) => {
  // Initialize audio - always render to prevent useAudio ref issues
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audio, _, controls] = useAudio({ 
    src: audioSrc || "/correct.wav"
  });

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (audioSrc) {
      void controls.play();
    }
    onClick();
  }, [disabled, onClick, controls, audioSrc]);

  const handleAudioPlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioSrc) {
      void controls.play();
    }
  }, [controls, audioSrc]);

  useKey(shortcut, handleClick, {}, [handleClick]);

  // Handle different card layouts based on exercise type
  const renderCard = () => {
    switch (type) {
      case "SELECT_IMAGE":
        return (
          <div className="text-center">
            {imageSrc && (
              <div className="relative aspect-square max-h-[120px] w-full lg:max-h-[200px]">
                <Image src={imageSrc} fill alt={text} className="rounded-lg object-fill" />
              </div>
            )}
            {text && (
              <p className={cn(
                "text-sm font-medium text-neutral-600 lg:text-base",
                selected && "text-sky-500",
                selected && status === "correct" && "text-green-500",
                selected && status === "wrong" && "text-rose-500"
              )}>
                {text}
              </p>
            )}
          </div>
        );

      case "MULTIPLE_CHOICE":
        return (
          <div>
            {imageSrc && (
              <div className="relative mb-4 aspect-square max-h-[80px] w-full lg:max-h-[120px]">
                <Image src={imageSrc} fill alt={text} className="rounded-lg object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm text-neutral-600 lg:text-base",
                selected && "text-sky-500",
                selected && status === "correct" && "text-green-500",
                selected && status === "wrong" && "text-rose-500"
              )}>
                {text}
              </p>
              <div className={cn(
                "flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
                selected && "border-sky-300 text-sky-500",
                selected && status === "correct" && "border-green-500 text-green-500",
                selected && status === "wrong" && "border-rose-500 text-rose-500"
              )}>
                {shortcut}
              </div>
            </div>
          </div>
        );

      case "MATCHING":
        return (
          <div className="text-center">
            <p className={cn(
              "text-sm font-medium text-neutral-700 lg:text-base",
              selected && "text-sky-500",
              isMatched && "text-green-500",
              selected && status === "wrong" && "text-rose-500"
            )}>
              {text}
            </p>
            {audioSrc && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAudioPlay}
                className="mt-2 p-1"
                disabled={disabled}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case "LISTENING":
        return (
          <div className="text-center">
            <p className={cn(
              "text-sm font-medium text-neutral-600 lg:text-base",
              selected && "text-sky-500",
              selected && status === "correct" && "text-green-500",
              selected && status === "wrong" && "text-rose-500"
            )}>
              {text}
            </p>
            <div className={cn(
              "mt-2 flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
              selected && "border-sky-300 text-sky-500",
              selected && status === "correct" && "border-green-500 text-green-500",
              selected && status === "wrong" && "border-rose-500 text-rose-500"
            )}>
              {shortcut}
            </div>
          </div>
        );

      case "PRONUNCIATION":
        return (
          <div className="text-center space-y-4">
            <p className="text-lg font-bold text-neutral-700 lg:text-xl">
              {text}
            </p>
            {audioSrc && (
            <Button
              variant="primaryOutline"
              onClick={handleAudioPlay}
              className="flex items-center gap-2"
              disabled={disabled}
            >
              <Volume2 className="h-4 w-4" />
              Play Pronunciation
            </Button>
            )}
            <Button
              variant="default"
              onClick={onClick}
              className="flex items-center gap-2"
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-sm text-neutral-600 lg:text-base",
              selected && "text-sky-500",
              selected && status === "correct" && "text-green-500",
              selected && status === "wrong" && "text-rose-500"
            )}>
              {text}
            </p>
            <div className={cn(
              "flex h-[20px] w-[20px] items-center justify-center rounded-lg border-2 text-xs font-semibold text-neutral-400 lg:h-[30px] lg:w-[30px] lg:text-[15px]",
              selected && "border-sky-300 text-sky-500",
              selected && status === "correct" && "border-green-500 text-green-500",
              selected && status === "wrong" && "border-rose-500 text-rose-500"
            )}>
              {shortcut}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      onClick={type !== "PRONUNCIATION" ? handleClick : undefined}
      className={cn(
        "h-full w-full rounded-xl border-2 border-b-4 p-2 hover:bg-black/5 active:border-b-2 lg:p-4",
        type !== "PRONUNCIATION" && "cursor-pointer",
        selected && "border-sky-300 bg-sky-100 hover:bg-sky-100",
        selected && status === "correct" && "border-green-300 bg-green-100 hover:bg-green-100",
        selected && status === "wrong" && "border-rose-300 bg-rose-100 hover:bg-rose-100",
        isMatched && "border-green-300 bg-green-100",
        disabled && "pointer-events-none hover:bg-white"
      )}
    >
      {audio}
      {renderCard()}
    </div>
  );
};
