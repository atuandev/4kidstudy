import type { JSX } from "react";

import type { MostWrongExerciseStats } from "@/types";

interface LessonWrongSectionProps {
  isLoadingMostWrong: boolean;
  mostWrongExercises: MostWrongExerciseStats[];
}

/**
 * Render section for most wrong exercises in a lesson.
 */
export function LessonWrongSection({
  isLoadingMostWrong,
  mostWrongExercises,
}: LessonWrongSectionProps): JSX.Element {
  if (isLoadingMostWrong) {
    return (
      <p className="text-sm text-muted-foreground">Đang tải...</p>
    );
  }
  if (mostWrongExercises.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có dữ liệu câu hỏi sai nhiều.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {mostWrongExercises.map((item, index) => (
        <div
          key={item.exerciseId}
          className="flex items-center justify-between border rounded-lg px-3 py-2 bg-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">
              #{index + 1}
            </span>
            <span className="text-sm">
              Câu {item.exerciseOrder}:{" "}
              {item.exercisePrompt || "Không có nội dung câu hỏi"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Sai lần 1</span>
              <span className="font-semibold text-red-500">
                {item.firstWrongCount}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Sai lần 2</span>
              <span className="font-semibold text-orange-500">
                {item.secondWrongCount}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-muted-foreground">Tổng</span>
              <span className="font-semibold text-yellow-600">
                {item.totalWrongCount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


