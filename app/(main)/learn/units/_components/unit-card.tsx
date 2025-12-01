"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopicWithProgress } from "@/types/topic-with-progress";
import Image from "next/image";
import { LibraryIcon, LibrarySquareIcon } from "lucide-react";
import { TypographyLarge } from "@/components/typography";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnitCardProps {
  readonly topic: TopicWithProgress;
}

const buildNavigationUrl = (
  topicId: number,
  type: "flashcard" | "sentence",
  continueFromLast: boolean,
  lastFlashcardIndex: number,
  lastSentenceIndex: number
) => {
  const basePath =
    type === "flashcard" ? "/learn/flashcards" : "/learn/sentences";
  const lastIndex =
    type === "flashcard" ? lastFlashcardIndex : lastSentenceIndex;
  if (continueFromLast && lastIndex > 0) {
    return `${basePath}/${topicId}?index=${lastIndex}`;
  }
  return `${basePath}/${topicId}`;
};

export function UnitCard({ topic }: UnitCardProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"flashcard" | "sentence">(
    "flashcard"
  );
  const lastFlashcardIndex = topic.progress.lastReviewedFlashcardIndex ?? 0;
  const lastSentenceIndex = topic.progress.lastReviewedSentenceIndex ?? 0;
  const flashcardProgress = topic.progress.flashcardProgress;
  const sentenceProgress = topic.progress.sentenceProgress;
  const hasFlashcardProgress = flashcardProgress > 0;
  const hasSentenceProgress = sentenceProgress > 0;
  const dialogProgressValue = useMemo(() => {
    if (dialogType === "flashcard") {
      return flashcardProgress;
    }
    return sentenceProgress;
  }, [dialogType, flashcardProgress, sentenceProgress]);
  const handleCardClick = (type: "flashcard" | "sentence") => {
    const progressValue =
      type === "flashcard" ? flashcardProgress : sentenceProgress;
    if (progressValue > 0) {
      setDialogType(type);
      setShowDialog(true);
      return;
    }
    navigateToContent(type, false);
  };
  const navigateToContent = (
    type: "flashcard" | "sentence",
    continueFromLast: boolean
  ) => {
    const url = buildNavigationUrl(
      topic.id,
      type,
      continueFromLast,
      lastFlashcardIndex,
      lastSentenceIndex
    );
    router.push(url);
    setShowDialog(false);
  };
  return (
    <Card id={`topic-${topic.id}`} className="transition-all hover:bg-muted/50 hover:shadow-md scroll-mt-4">
      <CardHeader>
        {topic.coverImage ? (
          <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={topic.coverImage}
              alt={topic.title || "Topic cover image"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-lg bg-muted">
            <span className="text-sm text-muted-foreground">
              No cover image
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <CardTitle className="text-xl font-bold">{topic.title}</CardTitle>
        <p className="mb-4 line-clamp-3 text-muted-foreground">
          {topic.description}
        </p>
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            variant="primary"
            className="relative w-full justify-start"
            onClick={() => handleCardClick("flashcard")}
          >
            <LibraryIcon className="h-4 w-4" />
            <TypographyLarge className="text-primary-foreground">
              Thẻ từ vựng
            </TypographyLarge>
            {hasFlashcardProgress && (
              <span className="ml-auto rounded-full bg-white/20 px-2 py-1 text-xs">
                {flashcardProgress}%
              </span>
            )}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="relative w-full justify-start"
            onClick={() => handleCardClick("sentence")}
          >
            <LibrarySquareIcon className="h-4 w-4" />
            <TypographyLarge className="text-primary-foreground">
              Thẻ câu
            </TypographyLarge>
            {hasSentenceProgress && (
              <span className="ml-auto rounded-full bg-white/20 px-2 py-1 text-xs">
                {sentenceProgress}%
              </span>
            )}
          </Button>
        </div>
      </CardContent>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiếp tục từ đâu?</DialogTitle>
            <DialogDescription>
              Bạn đã hoàn thành {dialogProgressValue}% của nội dung này. Bạn
              muốn tiếp tục từ đâu?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="secondaryOutline"
              onClick={() => navigateToContent(dialogType, false)}
            >
              Bắt đầu lại
            </Button>
            <Button
              variant="primary"
              onClick={() => navigateToContent(dialogType, true)}
            >
              Tiếp tục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
