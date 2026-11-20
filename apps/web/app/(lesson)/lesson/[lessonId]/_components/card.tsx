import { useCallback } from "react";

import Image from "next/image";
import { useAudio, useKey } from "react-use";
import { MicrophoneIcon, SpeakerHighIcon } from "@/components/icons";

import { ExerciseType } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { answerKeyClass, answerTileClass, keepEnterForCheck } from "./answer-tile";

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
    src: audioSrc || "/correct.wav",
  });

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (audioSrc) {
      void controls.play();
    }
    onClick();
  }, [disabled, onClick, controls, audioSrc]);

  const handleAudioPlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (audioSrc) {
        void controls.play();
      }
    },
    [controls, audioSrc],
  );

  useKey(shortcut, handleClick, {}, [handleClick]);

  // Handle different card layouts based on exercise type
  const renderCard = () => {
    switch (type) {
      case "SELECT_IMAGE":
        return (
          <div className="text-center">
            {imageSrc && (
              <div className="relative aspect-square w-full overflow-hidden rounded-[14px] bg-white">
                <Image
                  src={imageSrc}
                  fill
                  alt={text}
                  sizes="(min-width: 640px) 160px, 45vw"
                  className="object-contain"
                />
              </div>
            )}
            {text && <p className="mt-2 text-base font-extrabold sm:text-lg">{text}</p>}
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
              <p
                className={cn(
                  "text-sm text-ink lg:text-lg",
                  selected && "text-sky-ink",
                  selected && status === "correct" && "text-forest",
                  selected && status === "wrong" && "text-cherry-deep",
                )}
              >
                {text}
              </p>
              <div
                className={cn(
                  "hidden size-[30px] items-center justify-center rounded-lg border-2 text-sm font-black text-ink-meta lg:flex",
                  selected && "border-sky text-sky-ink",
                  selected && status === "correct" && "border-leaf text-forest",
                  selected && status === "wrong" && "border-cherry text-cherry-deep",
                )}
              >
                {shortcut}
              </div>
            </div>
          </div>
        );

      case "MATCHING":
        return (
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-extrabold text-ink lg:text-lg",
                selected && "text-sky-ink",
                isMatched && "text-forest",
                selected && status === "wrong" && "text-cherry-deep",
              )}
            >
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
                <SpeakerHighIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case "LISTENING":
        return (
          <div className="text-center">
            <p
              className={cn(
                "font-extrabold text-ink lg:text-lg",
                selected && "text-sky-ink",
                selected && status === "correct" && "text-forest",
                selected && status === "wrong" && "text-cherry-deep",
              )}
            >
              {text}
            </p>
            <div
              className={cn(
                "mt-2 hidden size-[30px] items-center justify-center rounded-lg border-2 text-sm font-black text-ink-meta lg:flex",
                selected && "border-sky text-sky-ink",
                selected && status === "correct" && "border-leaf text-forest",
                selected && status === "wrong" && "border-cherry text-cherry-deep",
              )}
            >
              {shortcut}
            </div>
          </div>
        );

      case "PRONUNCIATION":
        return (
          <div className="text-center space-y-4">
            <p className="text-lg font-bold text-ink lg:text-xl">{text}</p>
            {audioSrc && (
              <Button
                variant="primaryOutline"
                onClick={handleAudioPlay}
                className="flex items-center gap-2"
                disabled={disabled}
              >
                <SpeakerHighIcon className="h-4 w-4" />
                Nghe mẫu
              </Button>
            )}
            <Button
              variant="default"
              onClick={onClick}
              className="flex items-center gap-2"
              disabled={disabled}
            >
              <MicrophoneIcon className="h-4 w-4" />
              Ghi âm
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between">
            <p
              className={cn(
                "font-extrabold text-ink lg:text-lg",
                selected && "text-sky-ink",
                selected && status === "correct" && "text-forest",
                selected && status === "wrong" && "text-cherry-deep",
              )}
            >
              {text}
            </p>
            <div
              className={cn(
                "hidden size-[30px] items-center justify-center rounded-lg border-2 text-sm font-black text-ink-meta lg:flex",
                selected && "border-sky text-sky-ink",
                selected && status === "correct" && "border-leaf text-forest",
                selected && status === "wrong" && "border-cherry text-cherry-deep",
              )}
            >
              {shortcut}
            </div>
          </div>
        );
    }
  };

  const isButton = type !== "PRONUNCIATION";
  const Tag = isButton ? "button" : "div";

  return (
    <Tag
      {...(isButton
        ? {
            type: "button" as const,
            onClick: handleClick,
            onKeyDown: keepEnterForCheck,
            "aria-pressed": !!selected,
          }
        : {})}
      className={cn(
        answerTileClass({ selected, status, matched: isMatched, disabled }),
        "h-full p-2.5 sm:p-3",
      )}
    >
      {audio}
      {type === "SELECT_IMAGE" && (
        <span
          className={cn(
            answerKeyClass({ selected, status }),
            "absolute left-2 top-2 z-10 hidden lg:flex",
          )}
        >
          {shortcut}
        </span>
      )}
      {renderCard()}
    </Tag>
  );
};
