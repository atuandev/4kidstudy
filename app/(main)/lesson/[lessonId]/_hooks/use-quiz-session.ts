import { useEffect, useState } from 'react';
import { useQuizStore } from '@/lib/stores/quiz-store';
import { useExerciseStatsStore } from '@/lib/stores/exercise-stats-store';
import { Exercise } from '@/types';

type UseQuizSessionProps = {
  lessonId: number;
  exercises: Exercise[];
};

export function useQuizSession({ lessonId, exercises }: UseQuizSessionProps) {
  const { initializeQuiz, resetQuiz, activeIndex } = useQuizStore();
  const { startSession, endSession, startExercise, resetStats, startTime } = useExerciseStatsStore();

  // Initialize quiz and session - reset everything on mount
  useEffect(() => {
    // Reset everything first to ensure clean state
    resetQuiz();
    resetStats();
    
    // Then initialize with new data
    initializeQuiz(lessonId, exercises);
    startSession();
    
    if (exercises.length > 0) {
      startExercise();
    }

    return () => {
      endSession();
    };
  }, [lessonId, exercises, initializeQuiz, startSession, endSession, startExercise, resetQuiz, resetStats]);

  // Start new exercise when activeIndex changes
  useEffect(() => {
    if (activeIndex > 0 && activeIndex < exercises.length) {
      startExercise();
    }
  }, [activeIndex, exercises.length, startExercise]);

  // End session when quiz is completed
  useEffect(() => {
    if (activeIndex >= exercises.length) {
      endSession();
    }
  }, [activeIndex, exercises.length, endSession]);

  return {
    startTime,
  };
}

export function useQuizDuration(startTime: number | null) {
  const [, forceUpdate] = useState({});

  // Force re-render every second for realtime duration
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentDuration = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  return getCurrentDuration();
}

