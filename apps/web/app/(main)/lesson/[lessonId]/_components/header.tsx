"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FlameIcon,
  Trophy,
  TrophyIcon,
  XCircle,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { Separator } from "@/components/ui/separator";

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
  /** Grade of the lesson's topic; exiting returns to that grade's practice page. */
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
  profile,
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
    <header className="mx-auto flex w-full flex-col gap-y-4">
      {/* Top row with close button and stats */}
      <div className="flex items-center gap-4 justify-end">
        <div className="flex items-center gap-1">
          <TrophyIcon className="size-5 text-yellow-600" />
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {profile?.xp.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FlameIcon className="size-5 text-orange-600" />
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {profile?.streakDays}
          </span>
        </div>
        <span className="text-lg font-bold">Hello, {profile?.name}</span>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="default" size="icon">
                <ArrowLeft className="size-6" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc muốn thoát?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  Tiến trình của bạn sẽ không được lưu. Bạn sẽ phải bắt đầu lại bài học này từ đầu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleExit}>Thoát</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex items-center gap-x-2">
            <span className="text-xl font-bold text-slate-700">{unitTitle}</span>
            <span className="text-slate-400">•</span>
            <span className="text-lg font-semibold text-slate-500">{lessonTitle}</span>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-x-4 text-sm text-slate-600">
          {/* Current Exercise */}
          <div className="flex items-center gap-x-1 bg-gray-100 rounded-lg px-2 py-1">
            <span className="font-medium text-xl">
              Câu {currentExercise} / {totalExercises}
            </span>
          </div>

          {/* Correct Count */}
          <div className="flex items-center gap-x-1 bg-green-50 rounded-lg px-2 py-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="font-medium text-xl text-green-500">{correctCount}</span>
          </div>

          {/* Wrong Count */}
          <div className="flex items-center gap-x-1 bg-red-50 rounded-lg px-2 py-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="font-medium text-xl text-red-500">{wrongCount}</span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-x-1 bg-yellow-50 rounded-lg px-2 py-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-yellow-500 text-xl">{totalPoints}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-x-1 text-blue-500 bg-blue-50 rounded-lg px-2 py-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-xl text-blue-500">{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} />
    </header>
  );
};
