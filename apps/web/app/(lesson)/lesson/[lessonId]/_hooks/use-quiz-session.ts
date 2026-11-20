"use client";

import { useEffect, useState } from "react";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { Exercise } from "@/types";

type UseQuizSessionProps = {
  lessonId: number;
  exercises: Exercise[];
};

/**
 * Resets the quiz and stats stores for this lesson. Nothing reaches the
 * backend until the finish page saves the whole attempt.
 *
 * `isReady` is false until the reset has run, so a store left over from an
 * earlier lesson (or an earlier run of this one) is never shown or saved.
 */
export function useQuizSession({ lessonId, exercises }: UseQuizSessionProps) {
  const activeIndex = useQuizStore((state) => state.activeIndex);
  const [readyLessonId, setReadyLessonId] = useState<number | null>(null);

  useEffect(() => {
    const quiz = useQuizStore.getState();
    const stats = useExerciseStatsStore.getState();

    quiz.resetQuiz();
    stats.resetStats();
    quiz.initializeQuiz(lessonId, exercises);
    stats.startSession();
    if (exercises.length > 0) stats.startExercise();

    setReadyLessonId(lessonId);
    // The exercises come with the lesson; restart only when the lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Start timing each exercise after the first.
  useEffect(() => {
    if (activeIndex > 0 && activeIndex < exercises.length) {
      useExerciseStatsStore.getState().startExercise();
    }
  }, [activeIndex, exercises.length]);

  return { isReady: readyLessonId === lessonId };
}

export function useQuizDuration() {
  const startTime = useExerciseStatsStore((state) => state.startTime);
  const [now, setNow] = useState<number | null>(null);

  // Tick once a second while a quiz is running.
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime || now === null) return 0;
  // A tick from an earlier quiz can predate this startTime; clamp to 0.
  return Math.max(0, Math.floor((now - startTime) / 1000));
}
