"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentenceImage } from "@/types";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SentenceCard } from "./sentence-card";
import { useRouter, useSearchParams } from "next/navigation";

interface SentenceViewerProps {
  sentenceImages: SentenceImage[];
  topicTitle: string;
  onRecordReview?: (body: { contentType: 'FLASHCARD' | 'SENTENCE'; flashcardId?: number; sentenceId?: number; isMastered?: boolean }) => Promise<unknown>;
}

export function SentenceViewer({
  sentenceImages,
  topicTitle,
  onRecordReview,
}: SentenceViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIndex = parseInt(searchParams.get('index') || '0', 10);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update index when URL changes
  useEffect(() => {
    const index = parseInt(searchParams.get('index') || '0', 10);
    if (index >= 0 && index < sentenceImages.length) {
      setCurrentIndex(index);
    }
  }, [searchParams, sentenceImages.length]);

  const handleNext = () => {
    if (currentIndex < sentenceImages.length - 1) {
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

  if (sentenceImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có câu học</h3>
              <p className="text-muted-foreground">
                Chủ đề này chưa có câu học nào.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSentenceImage = sentenceImages[currentIndex];
  
  // Check if all active sentences in the current image are reviewed
  const currentSentences = currentSentenceImage.sentences.filter(s => s.isActive);
  const allReviewed = currentSentences.every(s => s.progress && s.progress.length > 0);
  const hasUnreviewed = currentSentences.some(s => !s.progress || s.progress.length === 0);

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <Card className="mb-8 bg-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button size="sm" variant="default" onClick={() => {
              router.back();
              router.refresh();
            }}>
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
        <SentenceCard sentenceImage={currentSentenceImage} onRecordReview={onRecordReview} />
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent>
          {/* Warning message if not all reviewed */}
          {hasUnreviewed && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ Vui lòng học hết tất cả các câu trong trang này để tiếp tục
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <p className="text-xl font-semibold">
              {currentIndex + 1} / {sentenceImages.length}
            </p>

            <Button
              variant="secondary"
              onClick={handleNext}
              disabled={currentIndex === sentenceImages.length - 1 || !allReviewed}
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
