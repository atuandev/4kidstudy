"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitAttempt } from "@/actions/attempt";
import { useProfile } from "@/hooks/use-profile";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { clearLessonProgress } from "@/lib/lesson-progress";

export type SaveStatus = "saving" | "saved" | "error";

export function useSaveAttempt(userId: number, lessonId: number) {
  const { fetchProfile } = useProfile();
  const [status, setStatus] = useState<SaveStatus>(() =>
    useQuizStore.getState().answers.length > 0 ? "saving" : "saved",
  );
  const durationRef = useRef<number | null>(null);
  const inFlightOrSavedRef = useRef(false);

  const send = useCallback(() => {
    inFlightOrSavedRef.current = true;
    return submitAttempt({
      lessonId,
      durationSec: durationRef.current ?? undefined,
      answers: useQuizStore.getState().answers,
    }).then(
      () => {
        clearLessonProgress(userId, lessonId);
        setStatus("saved");
        void fetchProfile();
      },
      (error: unknown) => {
        console.error("Failed to save attempt:", error);
        inFlightOrSavedRef.current = false;
        setStatus("error");
      },
    );
  }, [userId, lessonId, fetchProfile]);

  useEffect(() => {
    if (durationRef.current === null) {
      const stats = useExerciseStatsStore.getState();
      durationRef.current = stats.startTime
        ? Math.max(1, Math.floor((Date.now() - stats.startTime) / 1000))
        : stats.duration;
      stats.endSession();
    }

    if (inFlightOrSavedRef.current) return;
    if (useQuizStore.getState().answers.length === 0) return;
    void send();
  }, [send]);

  const retry = useCallback(() => {
    if (inFlightOrSavedRef.current) return;
    setStatus("saving");
    void send();
  }, [send]);

  return { status, retry };
}
