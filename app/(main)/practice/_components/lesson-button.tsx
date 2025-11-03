"use client";

import { Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Lesson } from "@/types";
import { LessonHistoryContent } from "./lesson-history-content";

import "react-circular-progressbar/dist/styles.css";

type LessonButtonProps = {
  id: number;
  lesson: Lesson;
};

export const LessonButton = ({ id, lesson }: LessonButtonProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="bg-background rounded-lg p-4 border-2 border-green-100 hover:bg-gray-50 transition-all flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-2xl font-bold">{lesson.title}</p>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-base font-medium">Số bài tập:</span>
            <Badge className="text-base">{lesson._count?.exercises}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsSheetOpen(true)}>
            Lịch sử luyện tập
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/lesson/${id}`}>Vào luyện tập</Link>
          </Button>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <LessonHistoryContent
          lesson={lesson}
          lessonId={id}
          isOpen={isSheetOpen}
        />
      </Sheet>
    </>
  );
};
