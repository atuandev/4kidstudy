"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { SentenceImage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AudioRecord } from "./audio-record";

interface SentenceCardProps {
  sentenceImage: SentenceImage;
  autoPlay?: boolean;
}

export function SentenceCard({
  sentenceImage,
  autoPlay = false,
}: SentenceCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (sentenceImage.audioUrl && autoPlay) {
      const audio = new Audio(sentenceImage.audioUrl);
      audioRef.current = audio;

      const timeoutId = setTimeout(() => {
        if (isMountedRef.current && audioRef.current) {
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {})
              .catch((error) => {
                if (error.name !== "AbortError") {
                  console.error("Auto-play failed:", error);
                }
              });
          }
        }
      }, 100);

      return () => {
        isMountedRef.current = false;
        clearTimeout(timeoutId);

        if (audioRef.current) {
          const currentAudio = audioRef.current;
          audioRef.current = null;

          Promise.resolve().then(() => {
            try {
              currentAudio.pause();
              currentAudio.currentTime = 0;
            } catch (error) {
              console.error("Error pausing audio:", error);
            }
          });
        }
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [sentenceImage.audioUrl, sentenceImage.id, autoPlay]);

  const handlePlayAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
    <Card className="w-full max-w-4xl overflow-hidden mx-auto">
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-y-hidden">
        <div className="flex h-full items-center justify-center p-8">
          <div className="relative h-full w-full max-w-2xl">
            <Image
              src={sentenceImage.imageUrl}
              alt="Sentence illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        {sentenceImage.audioUrl && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 h-12 w-12 rounded-full shadow-lg"
            onClick={() => handlePlayAudio(sentenceImage.audioUrl!)}
          >
            <Volume2 className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Sentences List */}
      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          {sentenceImage.sentences
            .filter((sentence) => sentence.isActive)
            .sort((a, b) => a.order - b.order)
            .map((sentence) => (
              <div
                key={sentence.id}
                className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    {/* English sentence */}
                    <p className="text-base font-medium leading-relaxed text-gray-900">
                      {sentence.text}
                    </p>

                    {/* Vietnamese meaning */}
                    {sentence.meaningVi && (
                      <p className="text-sm text-gray-600">
                        {sentence.meaningVi}
                      </p>
                    )}
                  </div>

                  {/* Audio button */}
                  {sentence.audioUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 bg-blue-50 hover:bg-blue-100 rounded-full"
                      onClick={() => handlePlayAudio(sentence.audioUrl!)}
                    >
                      <Volume2 className="h-5 w-5 text-blue-600" />
                    </Button>
                  )}

                  <AudioRecord
                    onStopPropagation={(e) => e.stopPropagation()}
                    resetTrigger={sentence.id}
                  />

                  {/* Hint button */}
                  {sentence.hintVi && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 shrink-0 bg-yellow-50 hover:bg-yellow-100 rounded-full"
                          >
                            <Lightbulb className="h-5 w-5 text-yellow-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm mt-1">{sentence.hintVi}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            ))}
        </div>

        {sentenceImage.sentences.filter((s) => s.isActive).length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <p>Không có câu học</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
