"use client";

import {
  ArrowCounterClockwiseIcon,
  BookOpenTextIcon,
  CardsIcon,
  ChatTextIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { TopicWithProgress } from "@/types/topic-with-progress";
import Image from "next/image";
import { type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface UnitCardProps {
  readonly topic: TopicWithProgress;
}

type ContentType = "flashcard" | "sentence";

const buildNavigationUrl = (topicId: number, type: ContentType, resumeIndex?: number) => {
  const basePath = type === "flashcard" ? "/learn/flashcards" : "/learn/sentences";
  if (resumeIndex === undefined) {
    return `${basePath}/${topicId}`;
  }
  return `${basePath}/${topicId}?index=${resumeIndex}&resume=1`;
};

export function UnitCard({ topic }: UnitCardProps) {
  const router = useRouter();
  const { flashcardProgress, sentenceProgress } = topic.progress;
  const resumeIndex: Record<ContentType, number | undefined> = {
    flashcard: topic.progress.lastReviewedFlashcardIndex,
    sentence: topic.progress.lastReviewedSentenceIndex,
  };
  const progress: Record<ContentType, number> = {
    flashcard: flashcardProgress,
    sentence: sentenceProgress,
  };
  const start = (type: ContentType) => {
    const index = progress[type] >= 100 ? undefined : resumeIndex[type];
    router.push(buildNavigationUrl(topic.id, type, index));
  };
  const restart = (type: ContentType) => router.push(buildNavigationUrl(topic.id, type));
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
          icon={<CardsIcon />}
          label="Thẻ từ vựng"
          echo="Words"
          progress={flashcardProgress > 0 ? flashcardProgress : null}
          onClick={() => start("flashcard")}
          onRestart={() => restart("flashcard")}
        />
        <TopicAction
          variant="secondary"
          icon={<ChatTextIcon />}
          label="Thẻ câu"
          echo="Sentences"
          progress={sentenceProgress > 0 ? sentenceProgress : null}
          onClick={() => start("sentence")}
          onRestart={() => restart("sentence")}
        />
      </div>
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
  readonly onRestart: () => void;
}

function TopicAction({
  variant,
  icon,
  label,
  echo,
  progress,
  onClick,
  onRestart,
}: TopicActionProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="lg"
        variant={variant}
        className="h-14 min-w-0 flex-1 justify-start gap-3 px-4 text-left [&_svg]:size-5"
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
      {progress !== null && progress < 100 ? (
        <Button
          size="icon"
          variant="default"
          className="h-14 w-12 shrink-0 [&_svg]:size-5"
          onClick={onRestart}
          aria-label={`${label}: bắt đầu lại`}
          title="Bắt đầu lại"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      ) : null}
    </div>
  );
}
