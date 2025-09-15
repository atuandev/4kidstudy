import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Grade, GradeValue } from '@/types/grade';
import { GRADES } from '@/types/grade';

interface GradeState {
  selectedGrade: GradeValue | null;
  selectedGradeData: Grade | null;
  topics: any[];
  isLoading: boolean;
  setSelectedGrade: (grade: GradeValue, topics?: any[]) => void;
  clearSelectedGrade: () => void;
  setLoading: (loading: boolean) => void;
  setTopics: (topics: any[]) => void;
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set) => ({
      selectedGrade: null,
      selectedGradeData: null,
      topics: [],
      isLoading: false,
      setSelectedGrade: (grade: GradeValue, topics = []) => {
        const gradeData = GRADES.find(g => g.value === grade);
        set({
          selectedGrade: grade,
          selectedGradeData: gradeData || null,
          topics,
        });
      },
      clearSelectedGrade: () => {
        set({
          selectedGrade: null,
          selectedGradeData: null,
          topics: [],
        });
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      setTopics: (topics: any[]) => {
        set({ topics });
      },
    }),
    {
      name: 'grade-store',
      partialize: (state) => ({
        selectedGrade: state.selectedGrade,
        selectedGradeData: state.selectedGradeData,
        topics: state.topics,
      }),
    }
  )
);
