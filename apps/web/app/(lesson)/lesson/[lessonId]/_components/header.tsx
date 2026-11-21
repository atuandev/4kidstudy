"use client";

import { CheckCircleIcon, ClockIcon, TrophyIcon, XCircleIcon, XIcon } from "@/components/icons";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { buildGradeHref } from "@/types/grade";
import { useRouter } from "next/navigation";
import { User } from "@/types";

type HeaderProps = {
  currentExercise: number;
  totalExercises: number;
  correctCount: number;
  wrongCount: number;
  totalPoints: number;
  duration: number;
  unitTitle: string;
  lessonTitle: string;
  profile: User;
  grade?: string;
};

export const Header = ({
  currentExercise,
  totalExercises,
  correctCount,
  wrongCount,
  totalPoints,
  duration,
  unitTitle,
  lessonTitle,
  grade,
}: HeaderProps) => {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExit = () => {
    router.push(buildGradeHref(grade, "practice"));
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = totalExercises > 0 ? Math.round((currentExercise / totalExercises) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-lime-rule bg-lime">
      <div className="mx-auto flex max-w-[1000px] items-center gap-3 px-4 pt-4 sm:gap-4 sm:pt-5">
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="icon"
              aria-label="Thoát bài học"
              className="size-11 text-ink"
            >
              <XIcon className="size-6" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc muốn thoát?</AlertDialogTitle>
              <AlertDialogDescription>
                Đừng lo, các câu bạn đã làm được lưu lại. Lần sau vào bài này, bạn có thể làm tiếp.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Học tiếp</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleExit}
                className="border-cherry-deep bg-cherry text-white hover:bg-cherry hover:brightness-95"
              >
                Thoát
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div
          role="progressbar"
          aria-label="Tiến độ bài học"
          aria-valuemin={0}
          aria-valuemax={totalExercises}
          aria-valuenow={currentExercise}
          className="relative h-4 flex-1 overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_2px_#D3EEC2]"
        >
          <div
            className="h-full rounded-full bg-leaf transition-[width] duration-500 ease-peel motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          >
            <span className="mx-2 mt-[3px] block h-1 rounded-full bg-white/40" aria-hidden="true" />
          </div>
        </div>

        <span className="shrink-0 text-base font-black tabular-nums text-ink">
          {currentExercise}
          <span className="text-ink-meta">/{totalExercises}</span>
        </span>
      </div>

      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-3 pt-3">
        <p className="min-w-0 truncate text-sm font-extrabold text-ink-body">
          {unitTitle}
          <span className="mx-1.5 text-ink-meta" aria-hidden="true">
            ·
          </span>
          {lessonTitle}
        </p>

        <ul className="flex items-center gap-1.5 text-sm font-black tabular-nums">
          <li className="flex items-center gap-1 rounded-full bg-leaf-wash px-2.5 py-1 text-forest">
            <CheckCircleIcon className="size-4" aria-hidden="true" />
            {correctCount}
            <span className="sr-only">câu đúng</span>
          </li>
          <li className="flex items-center gap-1 rounded-full bg-cherry-wash px-2.5 py-1 text-cherry-deep">
            <XCircleIcon className="size-4" aria-hidden="true" />
            {wrongCount}
            <span className="sr-only">câu sai</span>
          </li>
          <li className="flex items-center gap-1 rounded-full bg-sun-wash px-2.5 py-1 text-sun-ink">
            <TrophyIcon className="size-4" aria-hidden="true" />
            {totalPoints}
            <span className="sr-only">điểm</span>
          </li>
          <li className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-ink-body">
            <ClockIcon className="size-4" aria-hidden="true" />
            {formatTime(duration)}
            <span className="sr-only">thời gian</span>
          </li>
        </ul>
      </div>
    </header>
  );
};
