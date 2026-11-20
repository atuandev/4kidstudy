"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UnitCard } from "./unit-card";
import { TopicWithProgress } from "@/types/topic-with-progress";
import { LearningHistoryDialog } from "./learning-history-dialog";
import { GradeValue } from "@/types/grade";
import { getLearningStatsByGrade } from "@/actions/learning-progress/stats-by-grade";

interface UnitListProps {
  readonly topics: TopicWithProgress[];
  readonly grade: GradeValue;
}

const renderHeader = (grade: GradeValue) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h2 className="text-2xl font-bold">Danh sách chủ đề</h2>
    </div>
    <LearningHistoryDialog
      grade={grade}
      onOpen={async () => {
        return await getLearningStatsByGrade(grade);
      }}
    />
  </div>
);

export function UnitList({ topics, grade }: UnitListProps) {
  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Không có chủ đề nào cho lớp học này.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {renderHeader(grade)}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <div key={topic.id}>
            <UnitCard topic={topic} />
          </div>
        ))}
      </div>
    </div>
  );
}
