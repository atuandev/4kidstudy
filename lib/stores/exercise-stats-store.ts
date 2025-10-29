import { create } from "zustand";

type ExerciseStats = {
  duration: number; // in seconds
  totalPoints: number;
  correctCount: number;
  totalExercises: number;
  skippedCount: number;
  startTime: number | null;
  currentExerciseStartTime: number | null;
  isReviewMode: boolean;
};

type ExerciseStatsActions = {
  // Initialize session
  startSession: () => void;
  endSession: () => void;
  
  // Exercise tracking
  startExercise: () => void;
  completeExercise: (isCorrect: boolean, points: number) => void;
  skipExercise: () => void;
  
  // Review mode
  setReviewMode: (isReview: boolean) => void;
  
  // Getters
  getAccuracy: () => number;
  getAverageDuration: () => number;
  
  // Reset
  resetStats: () => void;
};

type ExerciseStatsStore = ExerciseStats & ExerciseStatsActions;

export const useExerciseStatsStore = create<ExerciseStatsStore>((set, get) => ({
  // Initial state
  duration: 0,
  totalPoints: 0,
  correctCount: 0,
  totalExercises: 0,
  skippedCount: 0,
  startTime: null,
  currentExerciseStartTime: null,
  isReviewMode: false,

  // Actions
  startSession: () => {
    set({
      startTime: Date.now(),
      duration: 0,
      totalPoints: 0,
      correctCount: 0,
      totalExercises: 0,
      skippedCount: 0,
      currentExerciseStartTime: null,
      isReviewMode: false,
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
    
    // Calculate duration if we have a start time
    let exerciseDuration = 0;
    if (state.currentExerciseStartTime) {
      exerciseDuration = Math.floor((currentTime - state.currentExerciseStartTime) / 1000);
    }
    
    // Award points based on phase and correctness
    // Normal phase: full points if correct (10), 0 if wrong
    // Review phase: half points if correct (5), 0 if wrong
    let pointsToAward = 0;
    if (isCorrect) {
      pointsToAward = state.isReviewMode ? Math.floor(points / 2) : points;
    }
    
    set({
      totalPoints: state.totalPoints + pointsToAward,
      correctCount: state.correctCount + (isCorrect ? 1 : 0),
      totalExercises: state.totalExercises + 1,
      duration: state.duration + exerciseDuration,
      currentExerciseStartTime: null,
    });
  },

  skipExercise: () => {
    const state = get();
    const currentTime = Date.now();
    
    // Calculate duration if we have a start time
    let exerciseDuration = 0;
    if (state.currentExerciseStartTime) {
      exerciseDuration = Math.floor((currentTime - state.currentExerciseStartTime) / 1000);
    }
    
    // Count skips but don't award points (0 points for skip)
    set({
      skippedCount: state.skippedCount + 1,
      totalExercises: state.totalExercises + 1,
      duration: state.duration + exerciseDuration,
      currentExerciseStartTime: null,
    });
  },

  setReviewMode: (isReview: boolean) => {
    set({ isReviewMode: isReview });
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

  resetStats: () => {
    set({
      duration: 0,
      totalPoints: 0,
      correctCount: 0,
      totalExercises: 0,
      skippedCount: 0,
      startTime: null,
      currentExerciseStartTime: null,
      isReviewMode: false,
    });
  },
}));
