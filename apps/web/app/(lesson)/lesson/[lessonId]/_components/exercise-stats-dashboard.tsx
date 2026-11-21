"use client";

import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { ResultCard } from "./result-card";

export function ExerciseStatsDashboard() {
  const { totalPoints, correctCount, skippedCount, duration, getAccuracy } =
    useExerciseStatsStore();

  const accuracy = getAccuracy();

  return (
    <div className="rotate-[-1deg] rounded-[32px] border-[6px] border-white bg-white p-5 text-ink shadow-[0_30px_50px_-24px_rgb(21_128_61/0.55)] sm:p-7">
      <p className="flex items-baseline justify-center gap-2">
        <span className="text-5xl font-black tabular-nums text-ink sm:text-6xl">
          +{totalPoints}
        </span>
        <span className="text-2xl font-black text-sun-ink">XP</span>
      </p>
      <p className="mt-1 text-center text-sm font-bold text-ink-meta">
        Điểm bé nhận được trong bài này
      </p>
      <dl
        className={`mt-6 grid grid-cols-2 gap-3 ${skippedCount > 0 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}
      >
        <ResultCard value={correctCount} variant="correct" />
        <ResultCard value={accuracy} variant="accuracy" />
        <ResultCard value={duration} variant="duration" />
        {skippedCount > 0 && <ResultCard value={skippedCount} variant="skipped" />}
      </dl>
    </div>
  );
}
