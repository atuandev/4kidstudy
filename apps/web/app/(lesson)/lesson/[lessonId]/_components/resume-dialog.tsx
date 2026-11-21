"use client";

import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { LessonProgress } from "@/lib/lesson-progress";

type ResumeDialogProps = {
  progress: LessonProgress;
  totalExercises: number;
  onResume: () => void;
  onRestart: () => void;
};

export const ResumeDialog = ({
  progress,
  totalExercises,
  onResume,
  onRestart,
}: ResumeDialogProps) => {
  const answered = Math.min(progress.activeIndex, totalExercises);
  const isAllAnswered = answered >= totalExercises;
  const resumeRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog open>
      <AlertDialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          resumeRef.current?.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Làm tiếp bài học nhé?</AlertDialogTitle>
          <AlertDialogDescription>
            {isAllAnswered
              ? "Bạn đã làm xong tất cả các câu nhưng kết quả chưa được lưu. Làm tiếp để lưu kết quả."
              : `Bạn đã làm ${answered}/${totalExercises} câu. Làm tiếp từ câu ${answered + 1} hoặc bắt đầu lại từ đầu.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onRestart}>Làm lại từ đầu</AlertDialogCancel>
          <AlertDialogAction ref={resumeRef} onClick={onResume}>
            Làm tiếp
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
