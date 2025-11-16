import { create } from 'zustand';

interface ExerciseFormStore {
  selectedGrade: string | null;
  selectedTopicId: number | null;
  selectedLessonId: number | null;
  setSelectedGrade: (grade: string | null) => void;
  setSelectedTopicId: (topicId: number | null) => void;
  setSelectedLessonId: (lessonId: number | null) => void;
  clearSelection: () => void;
}

export const useExerciseFormStore = create<ExerciseFormStore>((set) => ({
  selectedGrade: null,
  selectedTopicId: null,
  selectedLessonId: null,
  setSelectedGrade: (grade) => set({ selectedGrade: grade }),
  setSelectedTopicId: (topicId) => set({ selectedTopicId: topicId }),
  setSelectedLessonId: (lessonId) => set({ selectedLessonId: lessonId }),
  clearSelection: () => set({ selectedGrade: null, selectedTopicId: null, selectedLessonId: null }),
}));
