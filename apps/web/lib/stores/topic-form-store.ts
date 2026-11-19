import { create } from "zustand";

interface TopicFormState {
  selectedGrade: string | null;
  setSelectedGrade: (grade: string | null) => void;
  clearSelectedGrade: () => void;
}

export const useTopicFormStore = create<TopicFormState>((set) => ({
  selectedGrade: null,
  setSelectedGrade: (grade) => set({ selectedGrade: grade }),
  clearSelectedGrade: () => set({ selectedGrade: null }),
}));
