"use client";

import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { ResultCard } from "./result-card";

export function ExerciseStatsDashboard() {
  const { totalPoints, correctCount, skippedCount, duration, getAccuracy } =
    useExerciseStatsStore();

  const accuracy = getAccuracy();

  return (
    <div className="space-y-4">
      <ResultCard value={totalPoints} variant="points" />
      <div
        className={`grid gap-4 ${
          skippedCount > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        <ResultCard value={correctCount} variant="correct" />
        <ResultCard value={duration} variant="duration" />
        <ResultCard value={accuracy} variant="accuracy" />
        {/* Show skipped count if there are any skipped exercises */}
        {skippedCount > 0 && (
          <ResultCard value={skippedCount} variant="skipped" />
        )}
      </div>
    </div>
  );
}
