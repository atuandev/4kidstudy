"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import {
  clearLessonProgress,
  LessonProgress,
  readLessonProgress,
  writeLessonProgress,
} from "@/lib/lesson-progress";
import { Exercise } from "@/types";

type UseQuizSessionProps = {
  userId: number;
  lessonId: number;
  exercises: Exercise[];
};

export function useQuizSession({ userId, lessonId, exercises }: UseQuizSessionProps) {
  const activeIndex = useQuizStore((state) => state.activeIndex);
  const [readyLessonId, setReadyLessonId] = useState<number | null>(null);
  const [savedProgress, setSavedProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    const quiz = useQuizStore.getState();
    const stats = useExerciseStatsStore.getState();

    quiz.resetQuiz();
    stats.resetStats();
    quiz.initializeQuiz(lessonId, exercises);
    stats.startSession();
    if (exercises.length > 0) stats.startExercise();

    setSavedProgress(readLessonProgress(userId, lessonId, exercises));
    setReadyLessonId(lessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonId]);

  const isReady = readyLessonId === lessonId;
  const isChoosing = savedProgress !== null;

  useEffect(() => {
    if (activeIndex > 0 && activeIndex < exercises.length) {
      useExerciseStatsStore.getState().startExercise();
    }
  }, [activeIndex, exercises.length]);

  useEffect(() => {
    if (!isReady || isChoosing) return;

    const save = () => saveProgress(userId, lessonId, exercises);

    const unsubscribe = useQuizStore.subscribe((state, prev) => {
      if (
        state.answers !== prev.answers ||
        state.activeIndex !== prev.activeIndex ||
        state.status !== prev.status
      ) {
        save();
      }
    });
    const onHidden = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", save);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", save);
      save();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isChoosing, userId, lessonId]);

  const resume = useCallback(() => {
    if (!savedProgress) return;
    const { activeIndex, answers, exerciseAttempts, stats } = savedProgress;

    useQuizStore.getState().restoreQuiz(lessonId, exercises, {
      activeIndex,
      answers,
      exerciseAttempts,
    });
    const statsStore = useExerciseStatsStore.getState();
    statsStore.restoreSession(stats);
    if (activeIndex < exercises.length) statsStore.startExercise();

    setSavedProgress(null);
  }, [savedProgress, lessonId, exercises]);

  const restart = useCallback(() => {
    clearLessonProgress(userId, lessonId);
    const stats = useExerciseStatsStore.getState();
    stats.startSession();
    if (exercises.length > 0) stats.startExercise();
    setSavedProgress(null);
  }, [userId, lessonId, exercises.length]);

  return { isReady, savedProgress, resume, restart };
}

function saveProgress(userId: number, lessonId: number, exercises: Exercise[]) {
  const quiz = useQuizStore.getState();
  const stats = useExerciseStatsStore.getState();
  if (quiz.lessonId !== lessonId || quiz.exercises.length === 0) return;

  if (quiz.answers.length === 0) {
    clearLessonProgress(userId, lessonId);
    return;
  }

  const current = quiz.exercises[quiz.activeIndex];
  const tries = current ? (quiz.exerciseAttempts[current.id] ?? 0) : 0;
  const settledCorrect = quiz.status === "correct";
  const settledWrong = quiz.status === "wrong" && tries >= 2;
  const activeIndex = quiz.activeIndex + (settledCorrect || settledWrong ? 1 : 0);

  if (quiz.activeIndex >= exercises.length && stats.startTime === null) return;

  const elapsedSec = stats.startTime
    ? Math.max(0, Math.floor((Date.now() - stats.startTime) / 1000))
    : stats.duration;

  writeLessonProgress(userId, lessonId, {
    exerciseIds: quiz.exercises.map((e) => e.id),
    activeIndex,
    answers: quiz.answers,
    exerciseAttempts: quiz.exerciseAttempts,
    stats: {
      totalPoints: stats.totalPoints,
      correctCount: stats.correctCount,
      wrongCount: stats.wrongCount + (settledWrong ? 1 : 0),
      skippedCount: stats.skippedCount,
      totalExercises: stats.totalExercises,
      elapsedSec,
    },
  });
}

export function useQuizDuration() {
  const startTime = useExerciseStatsStore((state) => state.startTime);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime || now === null) return 0;
  return Math.max(0, Math.floor((now - startTime) / 1000));
}
