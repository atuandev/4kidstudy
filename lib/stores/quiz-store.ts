import { create } from 'zustand';
import { Exercise } from '@/types';

type QuizStatus = 'none' | 'wrong' | 'correct';
type QuizPhase = 'normal' | 'review' | 'transition';

type PronunciationState = {
  state: string;
  score: any | null;
};

type QuizState = {
  // Exercise navigation
  activeIndex: number;
  exercises: Exercise[];
  lessonId: number;
  
  // Selection state
  selectedOption: number | undefined;
  status: QuizStatus;
  
  // Pronunciation state
  pronunciation: PronunciationState;
  
  // Transition state
  isPending: boolean;
  
  // Wrong exercises tracking
  wrongExercises: Exercise[];
  phase: QuizPhase;
};

type QuizActions = {
  // Initialize quiz
  initializeQuiz: (lessonId: number, exercises: Exercise[]) => void;
  resetQuiz: () => void;
  
  // Navigation
  nextExercise: () => void;
  
  // Selection
  selectOption: (optionId: number) => void;
  clearSelection: () => void;
  
  // Status
  setStatus: (status: QuizStatus) => void;
  
  // Pronunciation
  updatePronunciation: (state: string, score?: any) => void;
  resetPronunciation: () => void;
  
  // Pending state
  setPending: (isPending: boolean) => void;
  
  // Wrong exercises
  addWrongExercise: (exercise: Exercise) => void;
  startReviewPhase: () => void;
  setPhase: (phase: QuizPhase) => void;
  
  // Getters
  getCurrentExercise: () => Exercise | undefined;
  getOptions: () => any[];
  isQuizComplete: () => boolean;
  shouldShowReview: () => boolean;
};

type QuizStore = QuizState & QuizActions;

const initialState: QuizState = {
  activeIndex: 0,
  exercises: [],
  lessonId: 0,
  selectedOption: undefined,
  status: 'none',
  pronunciation: {
    state: 'idle',
    score: null,
  },
  isPending: false,
  wrongExercises: [],
  phase: 'normal',
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  // Initialize quiz
  initializeQuiz: (lessonId: number, exercises: Exercise[]) => {
    set({
      lessonId,
      exercises,
      activeIndex: 0,
      selectedOption: undefined,
      status: 'none',
      pronunciation: {
        state: 'idle',
        score: null,
      },
      isPending: false,
      wrongExercises: [],
      phase: 'normal',
    });
  },

  resetQuiz: () => {
    set(initialState);
  },

  // Navigation
  nextExercise: () => {
    const state = get();
    set({
      activeIndex: state.activeIndex + 1,
      selectedOption: undefined,
      status: 'none',
      pronunciation: {
        state: 'idle',
        score: null,
      },
    });
  },

  // Selection
  selectOption: (optionId: number) => {
    const state = get();
    if (state.status !== 'none') return;
    
    set({ selectedOption: optionId });
  },

  clearSelection: () => {
    set({ 
      selectedOption: undefined,
      status: 'none',
    });
  },

  // Status
  setStatus: (status: QuizStatus) => {
    set({ status });
  },

  // Pronunciation
  updatePronunciation: (state: string, score?: any) => {
    set({
      pronunciation: {
        state,
        score: score ?? get().pronunciation.score,
      },
    });
  },

  resetPronunciation: () => {
    set({
      pronunciation: {
        state: 'idle',
        score: null,
      },
    });
  },

  // Pending state
  setPending: (isPending: boolean) => {
    set({ isPending });
  },

  // Wrong exercises
  addWrongExercise: (exercise: Exercise) => {
    const state = get();
    // Only add if not already in the list and is reviewable exercise type
    const isReviewableType = ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING'].includes(exercise.type);
    const alreadyAdded = state.wrongExercises.some(e => e.id === exercise.id);
    
    if (isReviewableType && !alreadyAdded) {
      set({
        wrongExercises: [...state.wrongExercises, exercise],
      });
    }
  },

  startReviewPhase: () => {
    const state = get();
    set({
      phase: 'review',
      exercises: state.wrongExercises,
      activeIndex: 0,
      selectedOption: undefined,
      status: 'none',
      pronunciation: {
        state: 'idle',
        score: null,
      },
    });
  },

  setPhase: (phase: QuizPhase) => {
    set({ phase });
  },

  // Getters
  getCurrentExercise: () => {
    const state = get();
    return state.exercises[state.activeIndex];
  },

  getOptions: () => {
    const exercise = get().getCurrentExercise();
    return exercise?.options ?? [];
  },

  isQuizComplete: () => {
    const state = get();
    return state.activeIndex >= state.exercises.length;
  },

  shouldShowReview: () => {
    const state = get();
    return state.wrongExercises.length > 0 && state.phase === 'normal';
  },
}));

