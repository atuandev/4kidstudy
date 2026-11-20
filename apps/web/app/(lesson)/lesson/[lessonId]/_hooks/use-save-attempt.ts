"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitAttempt } from "@/actions/attempt";
import { useProfile } from "@/hooks/use-profile";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";

export type SaveStatus = "saving" | "saved" | "error";

/**
 * Ends the session and saves the finished lesson in one request. Runs once
 * when the finish page mounts; `retry` sends the same answers again after a
 * failure. A saved attempt is never sent twice.
 */
export function useSaveAttempt(lessonId: number) {
  const { fetchProfile } = useProfile();
  // A lesson with no answers has nothing to save.
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
        setStatus("saved");
        // XP and streak changed on the server.
        void fetchProfile();
      },
      (error: unknown) => {
        console.error("Failed to save attempt:", error);
        inFlightOrSavedRef.current = false;
        setStatus("error");
      },
    );
  }, [lessonId, fetchProfile]);

  useEffect(() => {
    // Stop the clock once, before the first save.
    if (durationRef.current === null) {
      const stats = useExerciseStatsStore.getState();
      durationRef.current = stats.startTime
        ? Math.max(1, Math.floor((Date.now() - stats.startTime) / 1000))
        : stats.duration;
      stats.endSession();
    }

    // The ref also absorbs Strict Mode's second effect run.
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
