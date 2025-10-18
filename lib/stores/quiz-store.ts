import { create } from 'zustand';
import { Exercise } from '@/types';

type QuizStatus = 'none' | 'wrong' | 'correct';

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
  
  // Getters
  getCurrentExercise: () => Exercise | undefined;
  getOptions: () => any[];
  isQuizComplete: () => boolean;
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
}));

