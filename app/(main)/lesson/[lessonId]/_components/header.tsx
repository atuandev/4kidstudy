import { X, Trophy, Target, Clock } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

type HeaderProps = {
  currentExercise: number;
  totalExercises: number;
  correctCount: number;
  totalPoints: number;
  duration: number;
};

export const Header = ({
  currentExercise,
  totalExercises,
  correctCount,
  totalPoints,
  duration,
}: HeaderProps) => {
  const router = useRouter();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const accuracy =
    totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;

  const progress =
    totalExercises > 0
      ? Math.round((currentExercise / totalExercises) * 100)
      : 0;

  return (
    <header className="mx-auto flex w-full max-w-[1140px] flex-col gap-y-4 px-10 pt-[20px] lg:pt-[50px]">
      {/* Top row with close button and stats */}
      <div className="flex items-center justify-between">
        <X
          onClick={() => router.push("/practice")}
          className="cursor-pointer text-slate-500 transition hover:opacity-75"
        />

        {/* Real-time stats */}
        <div className="flex items-center gap-x-4 text-sm text-slate-600">
          {/* Current Exercise */}
          <div className="flex items-center gap-x-1 bg-gray-100 rounded-lg px-2 py-1">
            <span className="font-medium text-xl">
              Câu {currentExercise} / {totalExercises}
            </span>
          </div>

          {/* Accuracy */}
          {totalExercises > 0 && (
            <div className="flex items-center gap-x-1 bg-green-50 rounded-lg px-2 py-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="font-medium text-xl text-green-500">
                {accuracy}%
              </span>
            </div>
          )}

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
