import { UnitList } from "./_components/unit-list";
import { GRADES } from "@/types/grade";
import { getTopicsWithProgress } from "@/lib/data/get-topics-with-progress";
import { GraduationCap } from "lucide-react";

interface UnitsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const renderEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <GraduationCap className="mb-4 h-16 w-16 text-muted-foreground" />
    <h2 className="mb-2 text-2xl font-bold">Select a grade</h2>
    <p className="text-muted-foreground">
      Choose a grade from the navigation to load available topics.
    </p>
  </div>
);

export default async function UnitsPage({ searchParams }: UnitsPageProps) {
  const resolvedParams = await searchParams;
  const gradeParam = typeof resolvedParams?.grade === "string" ? resolvedParams.grade : undefined;
  const selectedGrade = gradeParam ? GRADES.find((grade) => grade.value === gradeParam) : undefined;
  if (!selectedGrade) {
    return <div className="flex flex-col gap-6">{renderEmptyState()}</div>;
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
