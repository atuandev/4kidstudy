"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/types";
import { AudioRecord } from "./audio-record";

interface FlashcardComponentProps {
  flashcard: Flashcard;
  className?: string;
}

export function FlashcardComponent({
  flashcard,
  className,
}: FlashcardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  
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
    const events = ['click', 'touchstart', 'keydown'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
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

    // Reset flip state when flashcard changes
    setIsFlipped(false);

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

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <div
        className={cn(
          "relative w-full max-w-md mx-auto perspective-1000",
          className
        )}
      >
        <Card
          className={cn(
            "relative w-full h-128 cursor-pointer transition-transform duration-500 preserve-3d",
            isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
        >
          {/* Front of the card */}
          <CardContent
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-6",
              "bg-gradient-to-br from-blue-50 to-indigo-100"
            )}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              {flashcard.imageUrl && (
                <div className="relative w-64 h-64 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={flashcard.imageUrl}
                    alt={flashcard.term}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <h2 className="text-5xl font-bold text-gray-800">
                  {flashcard.term}
                </h2>

                <p className="text-2xl text-gray-600 font-medium">
                  {flashcard.phonetic}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "p-2 rounded-full hover:bg-blue-300 bg-blue-200",
                      autoplayFailed && !hasUserInteracted && "animate-pulse ring-2 ring-blue-400"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(true);
                    }}
                    disabled={isLoading || !flashcard.audioUrl}
                  >
                    <Volume2
                      className={cn(
                        "h-6 w-6 text-blue-600",
                        isLoading && "animate-pulse"
                      )}
                    />
                  </Button>

                  <AudioRecord 
                    onStopPropagation={(e) => e.stopPropagation()}
                    resetTrigger={flashcard.id}
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 text-gray-500 flex items-center gap-1">
              <RotateCcw className="w-4 h-4" />
              Nhấn để lật
            </div>
          </CardContent>

          {/* Back of the card */}
          <CardContent
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6",
              "bg-gradient-to-br from-green-50 to-emerald-100"
            )}
          >
            <div className="flex flex-col items-center space-y-6 text-center">
              <h3 className="text-4xl font-bold text-gray-800">
                {flashcard.meaningVi}
              </h3>

              <div className="space-y-2">
                {flashcard.exampleEn && (
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600 italic">
                      "{flashcard.exampleEn}"
                    </p>
                  </div>
                )}

                {flashcard.exampleVi && (
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-600 italic">
                      "{flashcard.exampleVi}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-4 text-gray-500 flex items-center gap-1">
              <RotateCcw className="w-4 h-4" />
              Nhấn để lật
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
