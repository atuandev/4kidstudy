"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { History, BookOpen, MessageSquare, Target } from "lucide-react";
import { GradeValue } from "@/types/grade";
import { FlashcardDetailDialog } from "./flashcard-detail-dialog";
import { SentenceDetailDialog } from "./sentence-detail-dialog";
import { TopicDetailDialog } from "./topic-detail-dialog";

interface TopItem {
  id: number;
  name: string;
  reviewCount: number;
  topicName?: string;
}

interface LearningHistoryStats {
  totalReviewed: number;
  flashcardStats: {
    reviewed: number;
    total: number;
    percentage: number;
    topItems: TopItem[];
    allItems: TopItem[];
  };
  sentenceStats: {
    reviewed: number;
    total: number;
    percentage: number;
    topItems: TopItem[];
    allItems: TopItem[];
  };
  topicCount: number;
  topTopics: { id: number; name: string; reviewCount: number }[];
  topics: { id: number; name: string }[];
}

interface LearningHistoryDialogProps {
  grade: GradeValue;
  onOpen?: () => Promise<LearningHistoryStats | null>;
}

export function LearningHistoryDialog({ grade, onOpen }: LearningHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LearningHistoryStats | null>(null);

  const handleOpen = async () => {
    setOpen(true);
    if (onOpen) {
      setLoading(true);
      try {
        const data = await onOpen();
        setStats(data);
      } catch (error) {
        console.error("Failed to load learning history:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getGradeName = (grade: GradeValue) => {
    const gradeMap: Record<GradeValue, string> = {
      GRADE_1: "Lớp 1",
      GRADE_2: "Lớp 2",
      GRADE_3: "Lớp 3",
      GRADE_4: "Lớp 4",
      GRADE_5: "Lớp 5",
    };
    return gradeMap[grade] || grade;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" onClick={handleOpen}>
          <History className="size-5 text-sky-deep" />
          Tiến trình học
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tiến trình học · {getGradeName(grade)}</DialogTitle>
          <DialogDescription>
            Những thẻ từ, thẻ câu và chủ đề bé đã học ở lớp này.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-2" aria-busy="true">
            <div className="h-20 animate-pulse rounded-2xl bg-wash" />
            <div className="h-16 animate-pulse rounded-2xl bg-wash" />
            <div className="h-16 animate-pulse rounded-2xl bg-wash" />
          </div>
        ) : !stats ? (
          <p className="py-8 text-center text-base text-ink-body">
            Chưa có số liệu. Học vài thẻ từ hoặc thẻ câu rồi quay lại xem nhé.
          </p>
        ) : (
          <div>
            <div className="flex items-baseline gap-3 rounded-2xl bg-sky-wash px-5 py-4">
              <span className="text-4xl font-black tabular-nums text-sky-ink">
                {stats.totalReviewed}
              </span>
              <span className="text-base font-extrabold text-ink">thẻ đã học</span>
            </div>
            <ul className="mt-2 divide-y-2 divide-wash">
              <HistoryRow
                icon={<Target />}
                color="#1CB0F6"
                shade="#0284C7"
                name="Thẻ từ vựng"
                en="Words"
                value={`${stats.flashcardStats.reviewed} / ${stats.flashcardStats.total}`}
                percentage={stats.flashcardStats.percentage}
                detail={
                  <FlashcardDetailDialog
                    topItems={stats.flashcardStats.allItems}
                    topics={stats.topics}
                  />
                }
              />
              <HistoryRow
                icon={<MessageSquare />}
                color="#22C55E"
                shade="#15803D"
                name="Thẻ câu"
                en="Sentences"
                value={`${stats.sentenceStats.reviewed} / ${stats.sentenceStats.total}`}
                percentage={stats.sentenceStats.percentage}
                detail={
                  <SentenceDetailDialog
                    topItems={stats.sentenceStats.allItems}
                    topics={stats.topics}
                  />
                }
              />
              <HistoryRow
                icon={<BookOpen />}
                color="#A855F7"
                shade="#7E22CE"
                name="Chủ đề đã xong"
                en="Topics done"
                value={String(stats.topicCount)}
                detail={<TopicDetailDialog topTopics={stats.topTopics} />}
              />
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface HistoryRowProps {
  readonly icon: ReactNode;
  readonly color: string;
  readonly shade: string;
  readonly name: string;
  readonly en: string;
  readonly value: string;
  readonly percentage?: number;
  readonly detail: ReactNode;
}

/** One kind of content: an exercise-style tile, the count, an optional bar, and its detail list. */
function HistoryRow({ icon, color, shade, name, en, value, percentage, detail }: HistoryRowProps) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-tile border-4 border-white text-white [&_svg]:size-5"
        style={{ backgroundColor: color, boxShadow: `0 0 0 2px #E2E8F0, 0 8px 14px -6px ${shade}` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-black text-ink">
          {name} <span className="text-sm font-bold text-ink-meta">{en}</span>
        </p>
        <p className="text-lg font-black tabular-nums text-ink">
          {value}
          {percentage !== undefined ? (
            <span className="ml-2 text-sm font-bold text-ink-meta">{percentage.toFixed(0)}%</span>
          ) : null}
        </p>
        {percentage !== undefined ? (
          <div className="mt-1.5 h-2.5 rounded-full bg-wash" aria-hidden="true">
            <div
              className="h-full rounded-full bg-leaf"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="shrink-0">{detail}</div>
    </li>
  );
}
