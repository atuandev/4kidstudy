"use client";

import { useEffect, useState } from "react";
import { StudyEmpty, StudyHeader, StudyNav } from "@/components/learn/study-shell";
import { FlashcardComponent } from "./flashcard";
import { Flashcard } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { ReviewContentFormData } from "@/schemas/learning-progress";
import { buildGradeHref } from "@/types/grade";
import { clampStudyIndex, resumeStudyIndex } from "@/lib/study-index";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onRecordReview?: (body: ReviewContentFormData) => Promise<unknown>;
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
  const isResume = searchParams.has("resume");
  const basePath = `/learn/flashcards/${flashcards[0]?.topicId}`;
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = clampStudyIndex(indexParam, flashcards.length);
    if (!isResume) {
      return index;
    }
    const isFinished = initialMasteredIds.includes(flashcards[index]?.id);
    return resumeStudyIndex(index, flashcards.length, isFinished);
  });
  const [masteredFlashcardIds, setMasteredFlashcardIds] = useState<Set<number>>(
    new Set(initialMasteredIds),
  );

  useEffect(() => {
    if (isResume) {
      router.replace(`${basePath}?index=${currentIndex}`, { scroll: false });
    }
  }, [isResume, basePath, currentIndex, router]);

  const [syncedIndexParam, setSyncedIndexParam] = useState(indexParam);
  if (indexParam !== syncedIndexParam) {
    setSyncedIndexParam(indexParam);
    setCurrentIndex(clampStudyIndex(indexParam, flashcards.length));
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      router.replace(`${basePath}?index=${nextIndex}`, { scroll: false });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      router.replace(`${basePath}?index=${prevIndex}`, { scroll: false });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    router.replace(basePath, { scroll: false });
  };

  const handlePronunciationAssessed = (passed: boolean) => {
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
