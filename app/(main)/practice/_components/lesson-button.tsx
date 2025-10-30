"use client";

import { Check, Crown, History, Star, Target } from "lucide-react";
import Link from "next/link";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lesson } from "@/types";
import { LessonHistoryContent } from "./lesson-history-content";

import "react-circular-progressbar/dist/styles.css";

type LessonButtonProps = {
  id: number;
  index: number;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
  lesson: Lesson;
};

export const LessonButton = ({
  id,
  index,
  totalCount,
  locked,
  current,
  percentage,
  lesson,
}: LessonButtonProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;

  const rightPosition = indentationLevel * 40;

  const isFirst = index === 0;
  const isCompleted = !current && !locked;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="relative cursor-pointer"
            style={{
              right: `${rightPosition}px`,
              marginTop: isFirst && !isCompleted ? 60 : 24,
            }}
          >
            <Button
              size="rounded"
              variant={locked ? "locked" : "secondary"}
              className="h-[70px] w-[70px] border-b-8"
            >
              <p className="text-2xl font-bold">{index + 1}</p>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-80">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{lesson.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {lesson.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Số bài tập:</span>
                <Badge>{lesson._count?.exercises}</Badge>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full" variant="secondary">
                <Link href={`/lesson/${id}`}>Vào luyện tập</Link>
              </Button>
              <Button className="w-full" onClick={() => setIsSheetOpen(true)}>
                <History className="h-4 w-4 mr-2" />
                Xem lịch sử luyện tập
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

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
