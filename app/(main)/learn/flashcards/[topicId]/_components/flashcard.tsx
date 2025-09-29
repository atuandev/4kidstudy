"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Flashcard } from "@/types";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentPlayPromiseRef = useRef<Promise<void> | null>(null);

  const playAudio = async () => {
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
      }
    } catch (error) {
      // Only log non-abort errors to avoid console spam
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error playing audio:", error);
      }
    } finally {
      setIsLoading(false);
      currentPlayPromiseRef.current = null;
    }
  };

  // Auto-play audio when flashcard changes
  useEffect(() => {
    const autoPlayAudio = async () => {
      if (flashcard.audioUrl && !isLoading) {
        // Add a small delay to ensure the component has fully rendered
        setTimeout(() => {
          playAudio();
        }, 300);
      }
    };

    // Reset flip state when flashcard changes
    setIsFlipped(false);
    
    // Auto-play audio
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
        audioRef.current.src = '';
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
                    sizes="(max-width: 256px) 100vw, 256px"
                  />
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-800">
                  {flashcard.term}
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-2 rounded-full hover:bg-blue-300 bg-blue-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  disabled={isLoading || !flashcard.audioUrl}
                >
                  <Volume2
                    className={cn(
                      "w-5 h-5 text-blue-600",
                      isLoading && "animate-pulse"
                    )}
                  />
                </Button>

                <p className="text-lg text-gray-600 font-medium">
                  {flashcard.phonetic}
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 text-sm text-gray-500 flex items-center gap-1">
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
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-gray-800">
                  {flashcard.meaningVi}
                </h3>
              </div>

              <div className="space-y-3 max-w-sm">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-700 font-medium mb-1">
                    Example (English):
                  </p>
                  <p className="text-gray-600 italic">
                    "{flashcard.exampleEn}"
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-gray-700 font-medium mb-1">
                    Example (Vietnamese):
                  </p>
                  <p className="text-gray-600 italic">
                    "{flashcard.exampleVi}"
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 text-sm text-gray-500 flex items-center gap-1">
              <RotateCcw className="w-4 h-4" />
              Nhấn để lật
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
