"use client";

import { SentenceImage } from "@/types";
import { StudyEmpty, StudyHeader, StudyNav } from "@/components/learn/study-shell";
import { useEffect, useState } from "react";
import { SentenceCard } from "./sentence-card";
import { useRouter, useSearchParams } from "next/navigation";
import { ReviewContentFormData } from "@/schemas/learning-progress";
import { buildGradeHref } from "@/types/grade";
import { clampStudyIndex, resumeStudyIndex } from "@/lib/study-index";

interface SentenceViewerProps {
  sentenceImages: SentenceImage[];
  topicTitle: string;
  topicGrade: string;
  topicId: number;
  onRecordReview?: (body: ReviewContentFormData) => Promise<unknown>;
  initialMasteredIds?: number[]; // Sentence IDs with isMastered = true
}

export function SentenceViewer({
  sentenceImages,
  topicTitle,
  topicGrade,
  topicId,
  onRecordReview,
  initialMasteredIds = [],
}: SentenceViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const indexParam = searchParams.get("index");
  const isResume = searchParams.has("resume");
  const basePath = `/learn/sentences/${topicId}`;
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = clampStudyIndex(indexParam, sentenceImages.length);
    if (!isResume) {
      return index;
    }
    const active = sentenceImages[index]?.sentences.filter((s) => s.isActive) ?? [];
    const isFinished = active.length > 0 && active.every((s) => initialMasteredIds.includes(s.id));
    return resumeStudyIndex(index, sentenceImages.length, isFinished);
  });
  const [pronunciationPassedIds, setPronunciationPassedIds] = useState<Set<number>>(new Set());
  const [masteredSentenceIds, setMasteredSentenceIds] = useState<Set<number>>(
    new Set(initialMasteredIds),
  );

  // Follow the URL when ?index= changes (e.g. back/forward navigation).
  const [syncedIndexParam, setSyncedIndexParam] = useState(indexParam);
  if (indexParam !== syncedIndexParam) {
    setSyncedIndexParam(indexParam);
    setCurrentIndex(clampStudyIndex(indexParam, sentenceImages.length));
  }

  // "Continue" links carry ?resume; swap it for the image actually opened so a reload stays put.
  useEffect(() => {
    if (isResume) {
      router.replace(`${basePath}?index=${currentIndex}`, { scroll: false });
    }
  }, [isResume, basePath, currentIndex, router]);

  const handlePronunciationAssessed = (sentenceId: number, passed: boolean) => {
    // Track pronunciation passed in current session
    if (passed) {
      setPronunciationPassedIds((prev) => new Set(prev).add(sentenceId));
      // Also add to mastered list immediately for UI update (backend will confirm)
      setMasteredSentenceIds((prev) => new Set(prev).add(sentenceId));
    }
  };

  const handleNext = () => {
    if (currentIndex < sentenceImages.length - 1) {
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
    // Clear ?index too, or a reload would jump back to the old image.
    router.replace(basePath, { scroll: false });
  };

  if (sentenceImages.length === 0) {
    return (
      <StudyEmpty
        title="Chủ đề này chưa có thẻ câu"
        echo="No sentence cards here yet."
        body="Bé hãy chọn một chủ đề khác nhé."
        backHref={`${buildGradeHref(topicGrade, "learn/units")}#topic-${topicId}`}
      />
    );
  }

  const currentSentenceImage = sentenceImages[currentIndex];

  // Check if all active sentences in the current image are mastered or passed in current session
  const currentSentences = currentSentenceImage.sentences.filter((s) => s.isActive);
  const allCompleted = currentSentences.every(
    (s) => masteredSentenceIds.has(s.id) || pronunciationPassedIds.has(s.id),
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-10">
      <StudyHeader
        title={topicTitle}
        kind={{ vi: "Thẻ câu", en: "Sentence cards" }}
        backHref={`${buildGradeHref(topicGrade, "learn/units")}#topic-${topicId}`}
        index={currentIndex}
        total={sentenceImages.length}
        onReset={handleReset}
      />

      <SentenceCard
        sentenceImage={currentSentenceImage}
        onRecordReview={onRecordReview}
        onPronunciationAssessed={handlePronunciationAssessed}
        masteredSentenceIds={masteredSentenceIds}
      />

      <div className="mx-auto w-full max-w-2xl">
        <StudyNav
          isFirst={currentIndex === 0}
          isLast={currentIndex === sentenceImages.length - 1}
          isDone={allCompleted}
          doneLabel="Bé đã đọc đúng tất cả câu trong hình này"
          todoLabel="Đọc to từng câu và chấm điểm. Đạt trên 50% mỗi câu là mở hình tiếp theo."
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
