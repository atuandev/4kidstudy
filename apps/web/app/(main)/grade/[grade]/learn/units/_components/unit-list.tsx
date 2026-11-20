"use client";

import { Suspense } from "react";
import { PageHeading } from "@/components/page-heading";
import { UnitCard } from "./unit-card";
import { ProgressStrip, ProgressStripSkeleton } from "./progress-strip";
import { TopicWithProgress } from "@/types/topic-with-progress";
import { GRADES, GradeValue } from "@/types/grade";
import type { GradeLearningStats } from "@/actions/learning-progress/stats-by-grade";

interface UnitListProps {
  readonly topics: TopicWithProgress[];
  readonly grade: GradeValue;
  readonly statsPromise: Promise<GradeLearningStats>;
}

export function UnitList({ topics, grade, statsPromise }: UnitListProps) {
  if (topics.length === 0) {
    return (
      <p className="rounded-[28px] bg-white px-6 py-10 text-center text-base text-ink-body shadow-sheet-lime">
        Không có chủ đề nào cho lớp học này.
      </p>
    );
  }
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeading
        title={<>Chủ đề · {GRADES.find((item) => item.value === grade)?.label}</>}
        echo="Pick a topic to learn."
      />
      <Suspense fallback={<ProgressStripSkeleton />}>
        <ProgressStrip statsPromise={statsPromise} />
      </Suspense>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <UnitCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
