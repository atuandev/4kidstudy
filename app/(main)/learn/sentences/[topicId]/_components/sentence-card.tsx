"use client";

import Image from "next/image";
import { SentenceImage } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AudioRecord } from "./audio-record";
import { AudioControl } from "@/components/audio-control";
import { ReviewContentFormData } from "@/schemas/learning-progress";
import { useState } from "react";

interface SentenceCardProps {
  sentenceImage: SentenceImage;
  onRecordReview?: (body: ReviewContentFormData) => Promise<unknown>;
  onPronunciationAssessed?: (sentenceId: number, passed: boolean) => void;
  reviewedSentenceIds: Set<number>;
}

export function SentenceCard({
  sentenceImage,
  onRecordReview,
  onPronunciationAssessed,
  reviewedSentenceIds,
}: SentenceCardProps) {
  const handlePlayAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  const handleAssessmentComplete = (sentenceId: number) => (score: number, passed: boolean) => {
    onPronunciationAssessed?.(sentenceId, passed);
    
    // Record review only when assessment is passed
    if (passed && typeof onRecordReview === 'function') {
      onRecordReview({ 
        contentType: 'SENTENCE', 
        flashcardId: undefined,
        sentenceId 
      }).catch((error: unknown) => {
        console.error('record review failed', error);
      });
    }
  };

  return (
    <Card className="w-full overflow-hidden mx-auto">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Audio Player */}
          {sentenceImage.audioUrl && (
            <AudioControl
              audioUrl={sentenceImage.audioUrl}
              className="w-full px-4"
            />
          )}
          {/* Image Section */}
          <div className="relative aspect-video w-full">
            <Image
              src={sentenceImage.imageUrl}
              alt="Sentence illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-3">
          {sentenceImage.sentences
            .filter((sentence) => sentence.isActive)
            .sort((a, b) => a.order - b.order)
            .map((sentence) => {
              // Check if sentence is reviewed
              const isReviewed = reviewedSentenceIds.has(sentence.id);
              
              return (
                <div
                  key={sentence.id}
                  className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      {/* English sentence with reviewed indicator */}
                      <div className="flex items-center gap-2">
                        <p className="text-xl sm:text-2xl font-bold leading-relaxed text-gray-900">
                          {sentence.text}
                        </p>
                        {isReviewed && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Đã học</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {/* Vietnamese meaning */}
                      {sentence.meaningVi && (
                        <p className="text-lg sm:text-xl text-gray-600">
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
                      targetText={sentence.text}
                      onAssessmentComplete={handleAssessmentComplete(sentence.id)}
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
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="text-lg mt-1">{sentence.hintVi}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              );
            })}
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
