import type { JSX } from "react";

import type { MostWrongExerciseStats } from "@/types";
import { cn } from "@/lib/utils";

interface LessonWrongSectionProps {
  isLoadingMostWrong: boolean;
  mostWrongExercises: MostWrongExerciseStats[];
}

export function LessonWrongSection({
  isLoadingMostWrong,
  mostWrongExercises,
}: LessonWrongSectionProps): JSX.Element {
  if (isLoadingMostWrong) {
    return (
      <p role="status" className="text-sm font-bold text-ink-body">
        Đang tải...
      </p>
    );
  }
  if (mostWrongExercises.length === 0) {
    return <p className="text-sm font-bold text-ink-body">Chưa có câu nào bị sai nhiều.</p>;
  }
  return (
    <ol className="divide-y-2 divide-wash rounded-[22px] border-2 border-edge">
      {mostWrongExercises.map((item, index) => (
        <li
          key={item.exerciseId}
          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cherry-wash text-sm font-black text-cherry-deep"
            >
              {index + 1}
            </span>
            <p className="min-w-0 text-base text-ink">
              <span className="font-extrabold text-ink-body">Câu {item.exerciseOrder}: </span>
              <span className="font-bold">
                {item.exercisePrompt || "Không có nội dung câu hỏi"}
              </span>
            </p>
          </div>
          <dl className="flex shrink-0 gap-4 pl-11 text-sm sm:pl-0">
            <div className="flex flex-col-reverse items-end">
              <dt className="font-bold text-ink-body">Sai lần 1</dt>
              <dd
                className={cn(
                  "text-lg font-black tabular-nums",
                  item.firstWrongCount > 0 ? "text-cherry-deep" : "text-ink-body",
                )}
              >
                {item.firstWrongCount}
              </dd>
            </div>
            <div className="flex flex-col-reverse items-end">
              <dt className="font-bold text-ink-body">Sai lần 2</dt>
              <dd
                className={cn(
                  "text-lg font-black tabular-nums",
                  item.secondWrongCount > 0 ? "text-cherry-deep" : "text-ink-body",
                )}
              >
                {item.secondWrongCount}
              </dd>
            </div>
            <div className="flex flex-col-reverse items-end">
              <dt className="font-bold text-ink-body">Tổng</dt>
              <dd className="text-lg font-black tabular-nums text-ink">{item.totalWrongCount}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
