"use client";

import { useEffect, useState, useRef } from "react";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { Exercise } from "@/types";
import { startAttempt, completeAttempt } from "@/actions/attempt";

type UseQuizSessionProps = {
  lessonId: number;
  exercises: Exercise[];
};

export function useQuizSession({ lessonId, exercises }: UseQuizSessionProps) {
  const {
    initializeQuiz,
    resetQuiz,
    activeIndex,
    setAttemptId,
    attemptId,
  } = useQuizStore();

  // Get state values that need to be reactive
  const startTime = useExerciseStatsStore((state) => state.startTime);
  const duration = useExerciseStatsStore((state) => state.duration);

  const [isInitializing, setIsInitializing] = useState(true);
  const attemptCreatedRef = useRef(false);
  const completedAttemptsRef = useRef<Set<number>>(new Set());
  const lastLessonIdRef = useRef<number | null>(null);

  // Initialize quiz and session - reset everything on mount ONCE per lesson
  useEffect(() => {
    const isNewLesson = lastLessonIdRef.current !== lessonId;

    // Reset refs if lesson changed (check BEFORE async function)
    if (isNewLesson) {
      attemptCreatedRef.current = false;
      completedAttemptsRef.current.clear();
      lastLessonIdRef.current = lessonId;
    }

    async function initializeAttempt() {
      // Prevent double initialization for same lesson (handles Strict Mode)
      if (attemptCreatedRef.current) {
        return;
      }
      attemptCreatedRef.current = true;

      setIsInitializing(true);

      // Reset everything first to ensure clean state
      resetQuiz();
      useExerciseStatsStore.getState().resetStats();

      // Then initialize with new data
      initializeQuiz(lessonId, exercises);
      useExerciseStatsStore.getState().startSession();

      // Start attempt on backend
      try {
        const attempt = await startAttempt(lessonId);
        setAttemptId(attempt.id);
      } catch (error) {
        console.error("Failed to start attempt:", error);
        attemptCreatedRef.current = false; // Allow retry on error
      }

      if (exercises.length > 0) {
        useExerciseStatsStore.getState().startExercise();
      }

      setIsInitializing(false);
    }

    void initializeAttempt();
  }, [lessonId]);

  // Start new exercise when activeIndex changes
  useEffect(() => {
    if (activeIndex > 0 && activeIndex < exercises.length) {
      useExerciseStatsStore.getState().startExercise();
    }
  }, [activeIndex, exercises.length]);

  // Complete attempt when quiz is finished
  useEffect(() => {
    async function finishAttempt() {
      // Check if all exercises are complete first
      const allExercisesComplete = activeIndex >= exercises.length;
      
      if (!allExercisesComplete) return;
      
      // Use attemptId from closure - this is the attempt that was active when
      // activeIndex reached completion. If attemptId is null, we can't complete.
      if (!attemptId) return;
      
      // Prevent double completion for this specific attempt
      if (completedAttemptsRef.current.has(attemptId)) {
        return;
      }
      
      // Mark as completed BEFORE async operations to prevent race conditions
      completedAttemptsRef.current.add(attemptId);

      // Calculate duration BEFORE endSession (which sets startTime to null)
      let finalDuration = 0;

      if (startTime) {
        finalDuration = Math.floor((Date.now() - startTime) / 1000);
      } else if (duration > 0) {
        finalDuration = duration;
      } else {
        finalDuration = 1;
      }

      useExerciseStatsStore.getState().endSession();

      // Complete attempt on backend with calculated duration
      // Use the attemptId from closure to ensure we complete the correct attempt
      try {
        await completeAttempt(attemptId, { durationSec: finalDuration });
      } catch (error) {
        console.error("Failed to complete attempt:", error);
        // Remove from completed set to allow retry on error
        completedAttemptsRef.current.delete(attemptId);
      }
    }

    void finishAttempt();
  }, [
    activeIndex,
    exercises.length,
    attemptId,
    startTime,
    duration,
  ]);

  return {
    isInitializing,
    startTime,
  };
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
