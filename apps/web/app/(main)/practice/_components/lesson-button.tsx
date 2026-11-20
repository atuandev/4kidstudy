"use client";

import { CheckCircle2, Target } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Lesson } from "@/types";
import { getBestAttempt } from "@/actions/attempt";
import { LessonHistoryContent } from "./lesson-history-content";

type LessonButtonProps = {
  id: number;
  lesson: Lesson;
};

export const LessonButton = ({ id, lesson }: LessonButtonProps) => {
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
      <div
        className={`bg-background rounded-lg p-4 border-2 hover:bg-gray-50 transition-all flex items-center justify-between ${
          hasBestAttempt ? "border-green-500 bg-green-50/30" : "border-green-100"
        }`}
      >
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{lesson.title}</p>
            {hasBestAttempt && <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-base font-medium">Số câu hỏi:</span>
            <Badge className="text-base">{lesson._count?.exercises}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsSheetOpen(true)}>Lịch sử luyện tập</Button>
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
