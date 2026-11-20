import { create } from "zustand";
import { AttemptAnswer, Exercise, ExerciseOption } from "@/types";

type QuizStatus = "none" | "wrong" | "correct";

export interface PronunciationScore {
  accuracy?: number;
  fluency?: number;
  completeness?: number;
  prosody?: number;
  overall?: number;
}

type PronunciationState = {
  state: string;
  score: PronunciationScore | null;
};

type QuizState = {
  // Exercise navigation
  activeIndex: number;
  exercises: Exercise[];
  lessonId: number;

  // Final result per exercise, in the order answered. Saved on the finish page.
  answers: AttemptAnswer[];

  // Selection state
  selectedOption: number | undefined;
  selectedOption2: number | undefined;
  status: QuizStatus;

  // Pronunciation state
  pronunciation: PronunciationState;

  // Transition state
  isPending: boolean;

  // Attempt count per exercise (exerciseId -> attempt count)
  exerciseAttempts: Record<number, number>;
};

type QuizActions = {
  // Initialize quiz
  initializeQuiz: (lessonId: number, exercises: Exercise[]) => void;
  resetQuiz: () => void;

  // Answers
  recordAnswer: (answer: Omit<AttemptAnswer, "attempts">) => void;

  // Navigation
  nextExercise: () => void;

  // Selection
  selectOption: (optionId: number) => void;
  selectOptions: (optionId: number, optionId2?: number) => void;
  clearSelection: () => void;

  // Status
  setStatus: (status: QuizStatus) => void;

  // Pronunciation
  updatePronunciation: (state: string, score?: PronunciationScore | null) => void;
  resetPronunciation: () => void;

  // Pending state
  setPending: (isPending: boolean) => void;

  // Exercise attempts
  getExerciseAttemptCount: (exerciseId: number) => number;
  incrementExerciseAttempt: (exerciseId: number) => void;

  // Getters
  getCurrentExercise: () => Exercise | undefined;
  getOptions: () => ExerciseOption[];
  isQuizComplete: () => boolean;
};

type QuizStore = QuizState & QuizActions;

const initialState: QuizState = {
  activeIndex: 0,
  exercises: [],
  lessonId: 0,
  answers: [],
  selectedOption: undefined,
  selectedOption2: undefined,
  status: "none",
  pronunciation: {
    state: "idle",
    score: null,
  },
  isPending: false,
  exerciseAttempts: {},
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  // Initialize quiz
  initializeQuiz: (lessonId: number, exercises: Exercise[]) => {
    set({
      lessonId,
      exercises,
      activeIndex: 0,
      answers: [],
      selectedOption: undefined,
      selectedOption2: undefined,
      status: "none",
      pronunciation: {
        state: "idle",
        score: null,
      },
      isPending: false,
      exerciseAttempts: {},
    });
  },

  resetQuiz: () => {
    set(initialState);
  },

  // Answers: a retry or a skip after a wrong try replaces the exercise's
  // result, keeping its place, counting the try, and keeping the first wrong
  // choice in selectedOption2Id.
  recordAnswer: (answer) => {
    const { answers } = get();
    const index = answers.findIndex((a) => a.exerciseId === answer.exerciseId);

    if (index === -1) {
      set({ answers: [...answers, { ...answer, attempts: 1 }] });
      return;
    }

    const previous = answers[index];
    const merged: AttemptAnswer = {
      ...answer,
      attempts: Math.min(previous.attempts + 1, 2),
      selectedOption2Id:
        answer.selectedOption2Id ?? (!previous.isCorrect ? previous.selectedOptionId : undefined),
      timeSec: (previous.timeSec ?? 0) + (answer.timeSec ?? 0),
      pronunciation: answer.pronunciation ?? previous.pronunciation,
    };
    set({ answers: answers.map((a, i) => (i === index ? merged : a)) });
  },

  // Navigation
  nextExercise: () => {
    const state = get();
    set({
      activeIndex: state.activeIndex + 1,
      selectedOption: undefined,
      selectedOption2: undefined,
      status: "none",
      pronunciation: {
        state: "idle",
        score: null,
      },
    });
  },

  // Selection
  selectOption: (optionId: number) => {
    const state = get();
    if (state.status !== "none") return;

    set({ selectedOption: optionId, selectedOption2: undefined });
  },

  selectOptions: (optionId: number, optionId2?: number) => {
    const state = get();
    if (state.status !== "none") return;

    set({ selectedOption: optionId, selectedOption2: optionId2 });
  },

  clearSelection: () => {
    set({
      selectedOption: undefined,
      selectedOption2: undefined,
      status: "none",
    });
  },

  // Status
  setStatus: (status: QuizStatus) => {
    set({ status });
  },

  // Pronunciation
  updatePronunciation: (state: string, score?: PronunciationScore | null) => {
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
        state: "idle",
        score: null,
      },
    });
  },

  // Pending state
  setPending: (isPending: boolean) => {
    set({ isPending });
  },

  // Exercise attempts
  getExerciseAttemptCount: (exerciseId: number) => {
    const state = get();
    return state.exerciseAttempts[exerciseId] ?? 0;
  },

  incrementExerciseAttempt: (exerciseId: number) => {
    const state = get();
    const currentCount = state.exerciseAttempts[exerciseId] ?? 0;
    set({
      exerciseAttempts: {
        ...state.exerciseAttempts,
        [exerciseId]: currentCount + 1,
      },
    });
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
