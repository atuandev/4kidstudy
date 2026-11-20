import { create } from "zustand";

interface LessonFormStore {
  selectedGrade: string | null;
  selectedTopicId: number | null;
  setSelectedGrade: (grade: string | null) => void;
  setSelectedTopicId: (topicId: number | null) => void;
  clearSelection: () => void;
}

export const useLessonFormStore = create<LessonFormStore>((set) => ({
  selectedGrade: null,
  selectedTopicId: null,
  setSelectedGrade: (grade) => set({ selectedGrade: grade }),
  setSelectedTopicId: (topicId) => set({ selectedTopicId: topicId }),
  clearSelection: () => set({ selectedGrade: null, selectedTopicId: null }),
}));
