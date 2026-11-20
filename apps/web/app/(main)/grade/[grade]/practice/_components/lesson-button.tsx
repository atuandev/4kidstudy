"use client";

import { Check, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Lesson } from "@/types";
import { cn } from "@/lib/utils";
import { getBestAttempt } from "@/actions/attempt";
import { LessonHistoryContent } from "./lesson-history-content";

type LessonButtonProps = {
  id: number;
  lesson: Lesson;
  /** 1-based place in the topic, shown until the lesson has a best attempt. */
  position: number;
};

export const LessonButton = ({ id, lesson, position }: LessonButtonProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasBestAttempt, setHasBestAttempt] = useState(false);

  useEffect(() => {
    async function checkBestAttempt() {
      try {
        const bestAttempt = await getBestAttempt(id);
        setHasBestAttempt(bestAttempt !== null);
      } catch (error) {
        console.error("Failed to fetch best attempt:", error);
      }
    }
    checkBestAttempt();
  }, [id]);

  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full text-base font-black",
              hasBestAttempt ? "bg-leaf-deep text-white" : "bg-sky-wash text-sky-ink",
            )}
          >
            {hasBestAttempt ? (
              <Check className="size-5" strokeWidth={3} aria-label="Đã hoàn thành" />
            ) : (
              <span aria-hidden="true">{position}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-black leading-tight text-ink">{lesson.title}</p>
            <p className="text-sm font-bold text-ink-body">
              {lesson._count?.exercises ?? 0} câu hỏi
              {hasBestAttempt ? <span className="text-forest"> · Đã hoàn thành</span> : null}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Button onClick={() => setIsSheetOpen(true)}>
            <History aria-hidden="true" />
            Lịch sử
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/lesson/${id}`}>Vào luyện tập</Link>
          </Button>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <LessonHistoryContent lesson={lesson} lessonId={id} isOpen={isSheetOpen} />
      </Sheet>
    </>
  );
};
