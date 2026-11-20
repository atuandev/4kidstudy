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

/**
 * Resets the quiz and stats stores for this lesson. Nothing reaches the
 * backend until the finish page saves the whole attempt.
 *
 * Progress is saved in this browser after every answer (and when the page is
 * hidden or left), so the learner can stop and come back. If saved progress
 * exists, `savedProgress` is set and nothing is saved until the learner picks
 * `resume` or `restart`, so the old progress isn't overwritten by a fresh start.
 *
 * `isReady` is false until the reset has run, so a store left over from an
 * earlier lesson (or an earlier run of this one) is never shown or saved.
 */
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
    // The exercises come with the lesson; restart only when the lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonId]);

  const isReady = readyLessonId === lessonId;
  const isChoosing = savedProgress !== null;

  // Start timing each exercise after the first.
  useEffect(() => {
    if (activeIndex > 0 && activeIndex < exercises.length) {
      useExerciseStatsStore.getState().startExercise();
    }
  }, [activeIndex, exercises.length]);

  // Save progress after each answer, when the tab is hidden, and on leaving.
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
    // exercises are fixed for a lessonId (see above).
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
    // Time spent on the choice doesn't count.
    const stats = useExerciseStatsStore.getState();
    stats.startSession();
    if (exercises.length > 0) stats.startExercise();
    setSavedProgress(null);
  }, [userId, lessonId, exercises.length]);

  return { isReady, savedProgress, resume, restart };
}

/**
 * Writes the current stores as resumable progress. An exercise that is already
 * settled (answered correctly, or wrong twice) resumes at the next one; an
 * exercise left after one wrong try resumes on its second try.
 *
 * Once every exercise is answered, the finish page owns the save: progress is
 * written once on reaching it (so a failed submit can resume and retry) and
 * then left alone, so it can't come back after the submit clears it.
 */
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

  // The finish page stops the clock before it submits. From then on the save
  // written on reaching it stands until the submit succeeds and clears it.
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
