import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  SkipForward,
  Trophy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

type HeaderProps = {
  currentExercise: number;
  totalExercises: number;
  correctCount: number;
  skipCount: number;
  totalPoints: number;
  duration: number;
  unitTitle: string;
  lessonTitle: string;
};

export const Header = ({
  currentExercise,
  totalExercises,
  correctCount,
  skipCount,
  totalPoints,
  duration,
  unitTitle,
  lessonTitle,
}: HeaderProps) => {
  const router = useRouter();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress =
    totalExercises > 0
      ? Math.round((currentExercise / totalExercises) * 100)
      : 0;

  return (
    <header className="mx-auto flex w-full flex-col gap-y-4 pt-4">
      {/* Top row with close button and stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Button
            variant="default"
            size="icon"
            onClick={() => router.push("/practice")}
          >
            <ArrowLeft className="size-6" />
          </Button>

          <div className="flex items-center gap-x-2">
            <span className="text-xl font-bold text-slate-700">
              {unitTitle}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-lg font-semibold text-slate-500">
              {lessonTitle}
            </span>
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
            <span className="font-medium text-xl text-green-500">
              {correctCount}
            </span>
          </div>

          {/* Skip Count */}
          <div className="flex items-center gap-x-1 bg-red-50 rounded-lg px-2 py-1">
            <SkipForward className="h-4 w-4 text-red-500" />
            <span className="font-medium text-xl text-red-500">
              {skipCount}
            </span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-x-1 bg-yellow-50 rounded-lg px-2 py-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-yellow-500 text-xl">
              {totalPoints}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-x-1 text-blue-500 bg-blue-50 rounded-lg px-2 py-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-xl text-blue-500">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} />
    </header>
  );
};
