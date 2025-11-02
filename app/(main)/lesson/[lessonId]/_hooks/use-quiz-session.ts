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
  const attemptCompletedRef = useRef(false);
  const lastLessonIdRef = useRef<number | null>(null);

  // Initialize quiz and session - reset everything on mount ONCE per lesson
  useEffect(() => {
    const isNewLesson = lastLessonIdRef.current !== lessonId;

    // Reset refs if lesson changed (check BEFORE async function)
    if (isNewLesson) {
      attemptCreatedRef.current = false;
      attemptCompletedRef.current = false;
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
      // Prevent double completion
      if (attemptCompletedRef.current || !attemptId) return;

      // Check if all exercises are complete
      const allExercisesComplete = activeIndex >= exercises.length;

      if (allExercisesComplete) {
        attemptCompletedRef.current = true;

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
        try {
          await completeAttempt(attemptId, { durationSec: finalDuration });
        } catch (error) {
          console.error("Failed to complete attempt:", error);
          attemptCompletedRef.current = false; // Allow retry on error
        }
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
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!startTime) {
      setDuration(0);
      return;
    }

    // Function to calculate and update duration
    const updateDuration = () => {
      const now = Date.now();
      const newDuration = Math.floor((now - startTime) / 1000);
      setDuration(newDuration);
    };

    // Update immediately
    updateDuration();

    // Then update every second
    intervalRef.current = setInterval(updateDuration, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime]);

  return duration;
}
