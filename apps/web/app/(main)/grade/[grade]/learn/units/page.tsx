import { notFound } from "next/navigation";

import { UnitList } from "./_components/unit-list";
import { getGradeBySlug } from "@/types/grade";
import { getTopicsWithProgress } from "@/lib/data/get-topics-with-progress";

interface UnitsPageProps {
  readonly params: Promise<{ grade: string }>;
}

export default async function UnitsPage({ params }: UnitsPageProps) {
  const { grade } = await params;
  const selectedGrade = getGradeBySlug(grade);
  if (!selectedGrade) {
    notFound();
  }
  const { topics } = await getTopicsWithProgress(selectedGrade.value);
  if (topics.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">No topics yet</h2>
          <p className="text-muted-foreground">
            We could not find topics for the selected grade. Please try a different grade.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <UnitList topics={topics} grade={selectedGrade.value} />
    </div>
  );
}
