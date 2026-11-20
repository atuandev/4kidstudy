"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardComponent } from "./flashcard";
import { Flashcard } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { ReviewContentFormData } from "@/schemas/learning-progress";
import { buildGradeHref } from "@/types/grade";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  // server action passed down to record reviews when user completes pronunciation check
  onRecordReview?: (body: ReviewContentFormData) => Promise<unknown>;
  // flashcard IDs that have been mastered (isMastered = true, reviewCount >= 50)
  initialMasteredIds?: number[];
}

export function FlashcardViewer({
  flashcards,
  onRecordReview,
  initialMasteredIds = [],
}: FlashcardViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const indexParam = searchParams.get("index");
  const [currentIndex, setCurrentIndex] = useState(() => parseInt(indexParam || "0", 10));
  const [masteredFlashcardIds, setMasteredFlashcardIds] = useState<Set<number>>(
    new Set(initialMasteredIds),
  );

  // Follow the URL when ?index= changes (e.g. back/forward navigation).
  const [syncedIndexParam, setSyncedIndexParam] = useState(indexParam);
  if (indexParam !== syncedIndexParam) {
    setSyncedIndexParam(indexParam);
    const index = parseInt(indexParam || "0", 10);
    if (index >= 0 && index < flashcards.length) {
      setCurrentIndex(index);
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Update URL to persist navigation state
      router.replace(`/learn/flashcards/${flashcards[0].topicId}?index=${nextIndex}`, {
        scroll: false,
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      // Update URL to persist navigation state
      router.replace(`/learn/flashcards/${flashcards[0].topicId}?index=${prevIndex}`, {
        scroll: false,
      });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const handlePronunciationAssessed = (passed: boolean) => {
    // Update mastered status immediately if passed (for UI feedback)
    if (passed && flashcards[currentIndex]) {
      setMasteredFlashcardIds((prev) => new Set(prev).add(flashcards[currentIndex].id));
    }
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
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                // Navigate back to the correct grade/unit page and scroll to topic
                const grade = currentFlashcard.topic.grade;
                const topicId = currentFlashcard.topicId;
                router.push(`${buildGradeHref(grade, "learn/units")}#topic-${topicId}`);
              }}
            >
              <ArrowLeft className="size-8" />
            </Button>
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
          onPronunciationAssessed={handlePronunciationAssessed}
          isReviewed={masteredFlashcardIds.has(currentFlashcard.id)}
        />
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3 min-h-[80px]">
            <div className="flex items-center justify-center gap-4">
              <Button variant="primary" onClick={handlePrevious} disabled={currentIndex === 0}>
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </Button>

              <p className="text-xl font-semibold min-w-[80px] text-center">
                {currentIndex + 1} / {flashcards.length}
              </p>

              <Button
                variant="primary"
                onClick={handleNext}
                disabled={
                  currentIndex === flashcards.length - 1 ||
                  !masteredFlashcardIds.has(currentFlashcard.id)
                }
                title={
                  !masteredFlashcardIds.has(currentFlashcard.id)
                    ? "Vui lòng bấm Kiểm tra và đạt ≥ 50% để tiếp tục"
                    : ""
                }
              >
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-[24px] flex items-center justify-center">
              {!masteredFlashcardIds.has(currentFlashcard.id) && (
                <p className="text-sm text-orange-600 font-medium text-center">
                  ⚠️ Bấm &quot;Kiểm tra&quot; để đánh giá phát âm (cần ≥ 50% để tiếp tục)
                </p>
              )}
              {masteredFlashcardIds.has(currentFlashcard.id) && (
                <p className="text-sm text-green-600 font-medium text-center">
                  ✓ Flashcard này đã hoàn thành
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
