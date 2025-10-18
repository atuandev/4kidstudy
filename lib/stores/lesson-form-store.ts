import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lesson } from '@/types';

interface LessonFormState {
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson | null) => void;
  clearSelectedLesson: () => void;
}

export const useLessonFormStore = create<LessonFormState>()(
  persist(
    (set) => ({
      selectedLesson: null,
      setSelectedLesson: (lesson) => set({ selectedLesson: lesson }),
      clearSelectedLesson: () => set({ selectedLesson: null }),
    }),
    {
      name: 'lesson-form-store',
    }
  )
);

