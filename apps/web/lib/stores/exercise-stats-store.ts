import { create } from "zustand";

type ExerciseStats = {
  duration: number;
  totalPoints: number;
  correctCount: number;
  totalExercises: number;
  skippedCount: number;
  wrongCount: number;
  startTime: number | null;
  currentExerciseStartTime: number | null;
};

type ExerciseStatsActions = {
  startSession: () => void;
  restoreSession: (
    saved: Pick<
      ExerciseStats,
      "totalPoints" | "correctCount" | "wrongCount" | "skippedCount" | "totalExercises"
    > & { elapsedSec: number },
  ) => void;
  endSession: () => void;

  startExercise: () => void;
  completeExercise: (isCorrect: boolean, points: number) => void;
  skipExercise: () => void;
  incrementWrongCount: () => void;

  getAccuracy: () => number;
  getAverageDuration: () => number;

  resetStats: () => void;
};

type ExerciseStatsStore = ExerciseStats & ExerciseStatsActions;

export const useExerciseStatsStore = create<ExerciseStatsStore>((set, get) => ({
  duration: 0,
  totalPoints: 0,
  correctCount: 0,
  totalExercises: 0,
  skippedCount: 0,
  wrongCount: 0,
  startTime: null,
  currentExerciseStartTime: null,

  startSession: () => {
    set({
      startTime: Date.now(),
      duration: 0,
      totalPoints: 0,
      correctCount: 0,
      totalExercises: 0,
      skippedCount: 0,
      wrongCount: 0,
      currentExerciseStartTime: null,
    });
  },

  restoreSession: ({ elapsedSec, ...counts }) => {
    set({
      ...counts,
      duration: 0,
      startTime: Date.now() - elapsedSec * 1000,
      currentExerciseStartTime: null,
    });
  },

  endSession: () => {
    const state = get();
    if (state.startTime) {
      const sessionDuration = Math.floor((Date.now() - state.startTime) / 1000);
      set({
        duration: sessionDuration,
        startTime: null,
        currentExerciseStartTime: null,
      });
    }
  },

  startExercise: () => {
    set({
      currentExerciseStartTime: Date.now(),
    });
  },

  completeExercise: (isCorrect: boolean, points: number) => {
    const state = get();
    const currentTime = Date.now();

    let exerciseDuration = 0;
    if (state.currentExerciseStartTime) {
      exerciseDuration = Math.floor((currentTime - state.currentExerciseStartTime) / 1000);
    }

    set({
      totalPoints: state.totalPoints + points,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      totalExercises: state.totalExercises + 1,
      duration: state.duration + exerciseDuration,
      currentExerciseStartTime: null,
    });
  },

  skipExercise: () => {
    const state = get();
    const currentTime = Date.now();

    let exerciseDuration = 0;
    if (state.currentExerciseStartTime) {
      exerciseDuration = Math.floor((currentTime - state.currentExerciseStartTime) / 1000);
    }

    set({
      skippedCount: state.skippedCount + 1,
      totalExercises: state.totalExercises + 1,
      duration: state.duration + exerciseDuration,
      currentExerciseStartTime: null,
    });
  },

  getAccuracy: () => {
    const state = get();
    if (state.totalExercises === 0) return 0;
    return Math.round((state.correctCount / state.totalExercises) * 100);
  },

  getAverageDuration: () => {
    const state = get();
    if (state.totalExercises === 0) return 0;
    return Math.round(state.duration / state.totalExercises);
  },

  incrementWrongCount: () => {
    const state = get();
    set({
      wrongCount: state.wrongCount + 1,
    });
  },

  resetStats: () => {
    set({
      duration: 0,
      totalPoints: 0,
      correctCount: 0,
      totalExercises: 0,
      skippedCount: 0,
      wrongCount: 0,
      startTime: null,
      currentExerciseStartTime: null,
    });
  },
}));
