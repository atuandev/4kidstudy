"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardComponent } from "./flashcard";
import { Flashcard } from "@/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  // server action passed down to record reviews when user plays audio
  onRecordReview?: (body: {
    contentType: 'FLASHCARD' | 'SENTENCE';
    flashcardId?: number;
    sentenceId?: number;
    isMastered?: boolean;
  }) => Promise<any>;
}

export function FlashcardViewer({ flashcards, onRecordReview }: FlashcardViewerProps) {
  const searchParams = useSearchParams();
  const initialIndex = parseInt(searchParams.get('index') || '0', 10);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update index when URL changes
  useEffect(() => {
    const index = parseInt(searchParams.get('index') || '0', 10);
    if (index >= 0 && index < flashcards.length) {
      setCurrentIndex(index);
    }
  }, [searchParams, flashcards.length]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  if (flashcards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Flashcards</h3>
              <p className="text-muted-foreground">
                This topic doesn&apos;t have any flashcards yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <Card className="mb-8 bg-sky-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Link href={`/learn/units`}>
              <Button size="sm" variant="default">
                <ArrowLeft className="size-8" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold text-primary-foreground">
              {currentFlashcard.topic.title}
            </CardTitle>

            <Button
              variant="default"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Học lại
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Flashcard */}
      <div className="mb-8">
        <FlashcardComponent
          flashcard={currentFlashcard}
          className="mb-8"
          onRecordReview={onRecordReview}
        />
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="primary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <p className="text-xl font-semibold">
              {currentIndex + 1} / {flashcards.length}
            </p>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              Tiếp tục
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
