"use client";

import { useState } from "react";
import { StudyEmpty, StudyHeader, StudyNav } from "@/components/learn/study-shell";
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
      <StudyEmpty
        title="Chủ đề này chưa có thẻ từ vựng"
        echo="No word cards here yet."
        body="Bé hãy chọn một chủ đề khác nhé."
      />
    );
  }

  const currentFlashcard = flashcards[currentIndex];
  const isDone = masteredFlashcardIds.has(currentFlashcard.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-10">
      <StudyHeader
        title={currentFlashcard.topic.title}
        kind={{ vi: "Thẻ từ vựng", en: "Word cards" }}
        backHref={`${buildGradeHref(currentFlashcard.topic.grade, "learn/units")}#topic-${currentFlashcard.topicId}`}
        index={currentIndex}
        total={flashcards.length}
        onReset={handleReset}
      />

      <FlashcardComponent
        flashcard={currentFlashcard}
        onRecordReview={onRecordReview}
        onPronunciationAssessed={handlePronunciationAssessed}
        isReviewed={isDone}
      />

      <StudyNav
        isFirst={currentIndex === 0}
        isLast={currentIndex === flashcards.length - 1}
        isDone={isDone}
        doneLabel="Bé đã đọc đúng từ này"
        todoLabel="Bấm micro, đọc to từ này và chấm điểm. Đạt trên 50% là mở thẻ tiếp theo."
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
