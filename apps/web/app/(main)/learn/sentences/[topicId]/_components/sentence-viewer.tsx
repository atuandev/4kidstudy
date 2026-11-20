"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentenceImage } from "@/types";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { SentenceCard } from "./sentence-card";
import { useRouter, useSearchParams } from "next/navigation";
import { ReviewContentFormData } from "@/schemas/learning-progress";
import { buildGradeHref } from "@/types/grade";

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
  const [currentIndex, setCurrentIndex] = useState(() => parseInt(indexParam || "0", 10));
  const [pronunciationPassedIds, setPronunciationPassedIds] = useState<Set<number>>(new Set());
  const [masteredSentenceIds, setMasteredSentenceIds] = useState<Set<number>>(
    new Set(initialMasteredIds),
  );

  // Follow the URL when ?index= changes (e.g. back/forward navigation).
  const [syncedIndexParam, setSyncedIndexParam] = useState(indexParam);
  if (indexParam !== syncedIndexParam) {
    setSyncedIndexParam(indexParam);
    const index = parseInt(indexParam || "0", 10);
    if (index >= 0 && index < sentenceImages.length) {
      setCurrentIndex(index);
    }
  }

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
      router.replace(`/learn/sentences/${topicId}?index=${nextIndex}`, { scroll: false });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      router.replace(`/learn/sentences/${topicId}?index=${prevIndex}`, { scroll: false });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  if (sentenceImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có câu học</h3>
              <p className="text-muted-foreground">Chủ đề này chưa có câu học nào.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSentenceImage = sentenceImages[currentIndex];

  // Check if all active sentences in the current image are mastered or passed in current session
  const currentSentences = currentSentenceImage.sentences.filter((s) => s.isActive);
  const allCompleted = currentSentences.every(
    (s) => masteredSentenceIds.has(s.id) || pronunciationPassedIds.has(s.id),
  );
  const hasIncomplete = currentSentences.some(
    (s) => !masteredSentenceIds.has(s.id) && !pronunciationPassedIds.has(s.id),
  );

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <Card className="mb-8 bg-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                router.push(`${buildGradeHref(topicGrade, "learn/units")}#topic-${topicId}`);
              }}
            >
              <ArrowLeft className="size-8" />
            </Button>

            <CardTitle className="text-2xl font-bold text-primary-foreground">
              {topicTitle}
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

      {/* Sentence Card */}
      <div className="mb-8">
        <SentenceCard
          sentenceImage={currentSentenceImage}
          onRecordReview={onRecordReview}
          onPronunciationAssessed={handlePronunciationAssessed}
          masteredSentenceIds={masteredSentenceIds}
        />
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent>
          {/* Warning message if not all completed */}
          {hasIncomplete && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ Bấm &quot;Kiểm tra&quot; cho tất cả các câu để tiếp tục (cần ≥ 50% để tiếp tục)
              </p>
            </div>
          )}
          {allCompleted && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                ✓ Tất cả câu trong hình này đã hoàn thành
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <Button variant="secondary" onClick={handlePrevious} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <p className="text-xl font-semibold">
              {currentIndex + 1} / {sentenceImages.length}
            </p>

            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentIndex === sentenceImages.length - 1 || !allCompleted}
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
