"use client";

import { BookOpenTextIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { TopicWithProgress } from "@/types/topic-with-progress";
import Image from "next/image";
import { LibraryIcon, LibrarySquareIcon } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
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
  lastSentenceIndex: number,
) => {
  const basePath = type === "flashcard" ? "/learn/flashcards" : "/learn/sentences";
  const lastIndex = type === "flashcard" ? lastFlashcardIndex : lastSentenceIndex;
  if (continueFromLast && lastIndex > 0) {
    return `${basePath}/${topicId}?index=${lastIndex}`;
  }
  return `${basePath}/${topicId}`;
};

export function UnitCard({ topic }: UnitCardProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"flashcard" | "sentence">("flashcard");
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
    const progressValue = type === "flashcard" ? flashcardProgress : sentenceProgress;
    if (progressValue > 0) {
      setDialogType(type);
      setShowDialog(true);
      return;
    }
    navigateToContent(type, false);
  };
  const navigateToContent = (type: "flashcard" | "sentence", continueFromLast: boolean) => {
    const url = buildNavigationUrl(
      topic.id,
      type,
      continueFromLast,
      lastFlashcardIndex,
      lastSentenceIndex,
    );
    router.push(url);
    setShowDialog(false);
  };
  // Hand-placed tilt for the cover sticker, stable per topic.
  const tilt = topic.id % 2 === 0 ? 1 : -1;
  return (
    <article
      id={`topic-${topic.id}`}
      className="flex scroll-mt-4 flex-col rounded-[28px] bg-white p-4 shadow-sheet-lime sm:p-5"
    >
      {topic.coverImage ? (
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] border-[5px] border-white bg-wash shadow-sticker"
          style={{ rotate: `${tilt}deg` }}
        >
          <Image
            src={topic.coverImage}
            alt=""
            fill
            sizes="(min-width: 1280px) 340px, (min-width: 768px) 45vw, 92vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center rounded-[22px] bg-wash">
          <BookOpenTextIcon
            size={56}
            weight="duotone"
            className="text-ink-meta"
            aria-hidden="true"
          />
        </div>
      )}
      <h2 className="mt-5 text-xl font-black leading-snug text-ink">{topic.title}</h2>
      {topic.description ? (
        <p className="mt-1 line-clamp-2 text-base text-ink-body">{topic.description}</p>
      ) : null}
      <div className="mt-auto flex flex-col gap-2.5 pt-5">
        <TopicAction
          variant="primary"
          icon={<LibraryIcon />}
          label="Thẻ từ vựng"
          echo="Words"
          progress={hasFlashcardProgress ? flashcardProgress : null}
          onClick={() => handleCardClick("flashcard")}
        />
        <TopicAction
          variant="secondary"
          icon={<LibrarySquareIcon />}
          label="Thẻ câu"
          echo="Sentences"
          progress={hasSentenceProgress ? sentenceProgress : null}
          onClick={() => handleCardClick("sentence")}
        />
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiếp tục từ đâu?</DialogTitle>
            <DialogDescription>
              Bạn đã học được {dialogProgressValue}% phần này. Học tiếp từ chỗ cũ hay bắt đầu lại?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="default" onClick={() => navigateToContent(dialogType, false)}>
              Bắt đầu lại
            </Button>
            <Button variant="secondary" onClick={() => navigateToContent(dialogType, true)}>
              Học tiếp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

interface TopicActionProps {
  readonly variant: "primary" | "secondary";
  readonly icon: ReactNode;
  readonly label: string;
  readonly echo: string;
  readonly progress: number | null;
  readonly onClick: () => void;
}

/** A 3D action row: Vietnamese label, English echo, and how far the child got. */
function TopicAction({ variant, icon, label, echo, progress, onClick }: TopicActionProps) {
  return (
    <Button
      size="lg"
      variant={variant}
      className="h-14 w-full justify-start gap-3 px-4 text-left [&_svg]:size-5"
      onClick={onClick}
    >
      {icon}
      <span className="flex flex-col leading-tight">
        <span className="text-base font-extrabold">{label}</span>
        <span className="text-sm font-extrabold text-white">{echo}</span>
      </span>
      {progress !== null ? (
        <span className="ml-auto flex items-center gap-2">
          <span
            className="hidden h-2 w-14 overflow-hidden rounded-full bg-white/30 sm:block"
            aria-hidden="true"
          >
            <span
              className="block h-full rounded-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </span>
          <span className="text-sm font-black tabular-nums">{progress}%</span>
        </span>
      ) : null}
    </Button>
  );
}
