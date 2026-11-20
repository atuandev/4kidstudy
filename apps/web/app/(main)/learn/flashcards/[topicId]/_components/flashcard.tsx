"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ArrowCounterClockwiseIcon, SpeakerHighIcon } from "@/components/icons";
import { RoundButton } from "@/components/learn/round-button";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/types";
import { AudioRecord } from "./audio-record";
import { ReviewContentFormData } from "@/schemas/learning-progress";

interface FlashcardComponentProps {
  flashcard: Flashcard;
  className?: string;
  onRecordReview?: (body: ReviewContentFormData) => Promise<unknown>;
  onPronunciationAssessed?: (passed: boolean) => void;
  isReviewed?: boolean; // Whether this flashcard has been reviewed before
}

export function FlashcardComponent({
  flashcard,
  className,
  onRecordReview,
  onPronunciationAssessed,
  isReviewed = false,
}: FlashcardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [pronunciationPassed, setPronunciationPassed] = useState(isReviewed);

  // Reset per-card state when the flashcard changes (during render, not in an effect).
  const cardKey = `${flashcard.id}:${flashcard.audioUrl ?? ""}`;
  const [resetCardKey, setResetCardKey] = useState(cardKey);
  if (cardKey !== resetCardKey) {
    setResetCardKey(cardKey);
    setIsFlipped(false);
    // Only reset pronunciation status if not already reviewed
    if (!isReviewed) {
      setPronunciationPassed(false);
    }
  }

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentPlayPromiseRef = useRef<Promise<void> | null>(null);

  const playAudio = async (isManualPlay = false) => {
    if (!flashcard.audioUrl || isLoading) return;

    try {
      setIsLoading(true);

      // Wait for any existing play promise to complete or fail
      if (currentPlayPromiseRef.current) {
        try {
          await currentPlayPromiseRef.current;
        } catch {
          // Ignore errors from previous play attempts
        }
      }

      if (audioRef.current) {
        // Pause and reset audio before setting new source
        audioRef.current.pause();
        audioRef.current.currentTime = 0;

        // Set new source
        audioRef.current.src = flashcard.audioUrl;

        // Create new play promise and store reference
        const playPromise = audioRef.current.play();
        currentPlayPromiseRef.current = playPromise;

        await playPromise;

        // If manual play succeeds, mark user as having interacted and clear autoplay failure
        if (isManualPlay) {
          setHasUserInteracted(true);
          setAutoplayFailed(false);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          // User hasn't interacted with document yet
          if (!isManualPlay) {
            setAutoplayFailed(true);
          }
        } else if (error.name !== "AbortError") {
          // Only log non-abort errors to avoid console spam
          console.error("Error playing audio:", error);
        }
      }
    } finally {
      setIsLoading(false);
      currentPlayPromiseRef.current = null;
    }
  };

  // Detect user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
      setAutoplayFailed(false);
    };

    // Listen for various user interactions
    const events = ["click", "touchstart", "keydown"];

    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Auto-play audio when flashcard changes
  useEffect(() => {
    const autoPlayAudio = async () => {
      if (flashcard.audioUrl && !isLoading) {
        // Reset autoplay failed state for new flashcard
        setAutoplayFailed(false);

        // Add a small delay to ensure the component has fully rendered
        setTimeout(() => {
          playAudio();
        }, 300);
      }
    };

    // Always try auto-play (will fail gracefully if user hasn't interacted)
    autoPlayAudio();

    // Cleanup function to handle component unmount or flashcard change
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      currentPlayPromiseRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashcard.id, flashcard.audioUrl]); // Trigger when flashcard changes

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      currentPlayPromiseRef.current = null;
    };
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAssessmentComplete = useCallback(
    (score: number, passed: boolean) => {
      // console.log(`[Flashcard ${flashcard.id}] Assessment complete:`, { score, passed });
      setPronunciationPassed(passed);
      onPronunciationAssessed?.(passed);

      // Record review and set isMastered = true if passed (>= 50%)
      if (typeof onRecordReview === "function") {
        // console.log(`[Flashcard ${flashcard.id}] Calling reviewContent API with isMastered=${passed}...`);
        onRecordReview({
          contentType: "FLASHCARD",
          flashcardId: flashcard.id,
          sentenceId: undefined,
          // Only ever set mastered: a failed retry must not un-master a card already passed.
          isMastered: passed ? true : undefined,
        })
          .then((result) => {
            // console.log(`[Flashcard ${flashcard.id}] reviewContent success:`, result);
          })
          .catch((error: unknown) => {
            console.error(`[Flashcard ${flashcard.id}] record review failed:`, error);
          });
      } else {
        console.warn(`[Flashcard ${flashcard.id}] onRecordReview is not a function`);
      }
    },
    [flashcard.id, onRecordReview, onPronunciationAssessed],
  );

  const face =
    "backface-hidden absolute inset-0 flex flex-col items-center rounded-sheet border-[6px] border-white bg-white px-5 pb-4 pt-6 text-center shadow-sheet-lime sm:px-8";

  const flipHint = (
    <button
      type="button"
      className="mt-auto inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold text-ink-body outline-none transition-colors hover:bg-wash focus-visible:ring-4 focus-visible:ring-sky/50"
    >
      <ArrowCounterClockwiseIcon className="size-4" aria-hidden="true" />
      {isFlipped ? "Lật lại mặt trước" : "Chạm vào thẻ để xem nghĩa"}
    </button>
  );

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <div className={cn("perspective-1000 relative mx-auto w-full max-w-md", className)}>
        <div
          className={cn(
            "preserve-3d relative h-[30rem] w-full cursor-pointer transition-transform duration-500 ease-peel motion-reduce:transition-none sm:h-[32rem]",
            isFlipped && "rotate-y-180",
          )}
          onClick={handleFlip}
        >
          {/* Front: picture, word, listen and record */}
          <div className={face} inert={isFlipped}>
            {flashcard.imageUrl && (
              <div className="relative aspect-square w-[min(15rem,62%)] -rotate-1 overflow-hidden rounded-[22px] border-[5px] border-white bg-wash shadow-sticker">
                <Image
                  src={flashcard.imageUrl}
                  alt={flashcard.term}
                  fill
                  sizes="240px"
                  loading="eager"
                  className="object-cover"
                />
              </div>
            )}

            <h2 className="mt-5 text-4xl font-black leading-tight text-ink sm:text-5xl">
              {flashcard.term}
            </h2>
            {flashcard.phonetic ? (
              <p className="mt-1 text-xl font-bold text-ink-body">{flashcard.phonetic}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <RoundButton
                size="lg"
                aria-label={`Nghe từ ${flashcard.term}`}
                className={cn(
                  autoplayFailed &&
                    !hasUserInteracted &&
                    "ring-4 ring-sky/50 motion-safe:animate-pulse",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(true);
                }}
                disabled={isLoading || !flashcard.audioUrl}
              >
                <SpeakerHighIcon aria-hidden="true" />
              </RoundButton>

              <AudioRecord
                onStopPropagation={(e) => e.stopPropagation()}
                resetTrigger={flashcard.id}
                targetText={flashcard.term}
                onAssessmentComplete={handleAssessmentComplete}
              />
            </div>

            {flipHint}
          </div>

          {/* Back: the Vietnamese meaning and examples */}
          <div className={cn(face, "rotate-y-180 justify-center")} inert={!isFlipped}>
            {flashcard.imageUrl ? (
              <div className="relative mt-auto size-24 rotate-2 overflow-hidden rounded-[18px] border-4 border-white bg-wash shadow-sticker">
                <Image src={flashcard.imageUrl} alt="" fill sizes="96px" className="object-cover" />
              </div>
            ) : null}
            <p
              className={cn(
                "text-xl font-black text-ink-body",
                flashcard.imageUrl ? "mt-4" : "mt-auto",
              )}
            >
              {flashcard.term}
            </p>
            <h3 className="mt-1 text-4xl font-black leading-tight text-forest sm:text-5xl">
              {flashcard.meaningVi}
            </h3>

            {flashcard.exampleEn || flashcard.exampleVi ? (
              <div className="mt-6 w-full rounded-[22px] bg-wash px-5 py-4 text-left">
                {flashcard.exampleEn ? (
                  <p className="text-lg font-extrabold text-ink">{flashcard.exampleEn}</p>
                ) : null}
                {flashcard.exampleVi ? (
                  <p className="mt-1 text-base font-semibold text-ink-body">
                    {flashcard.exampleVi}
                  </p>
                ) : null}
              </div>
            ) : null}

            {flipHint}
          </div>
        </div>
      </div>
    </>
  );
}
