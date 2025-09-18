"use client";

import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { ResultCard } from "./result-card";

export function ExerciseStatsDashboard() {
  const {
    totalPoints,
    correctCount,
    skippedCount,
    duration,
    getAccuracy,
  } = useExerciseStatsStore();

  const accuracy = getAccuracy();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ResultCard value={totalPoints} variant="points" />
        <ResultCard value={correctCount} variant="correct" />
        <ResultCard value={duration} variant="duration" />
        <ResultCard value={accuracy} variant="accuracy" />
      </div>
      
      {/* Show skipped count if there are any skipped exercises */}
      {skippedCount > 0 && (
        <div className="flex justify-center">
          <div className="w-48">
            <ResultCard value={skippedCount} variant="skipped" />
          </div>
        </div>
      )}
    </div>
  );
}
