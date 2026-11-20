import { getPracticeStatistics } from "@/actions/attempt";
import Units from "./_components/units";
import { getTopicsWithProgress } from "@/lib/data/get-topics-with-progress";
import { GRADES } from "@/types/grade";

interface PracticePageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PracticePage({
  searchParams,
}: PracticePageProps) {
  const resolvedParams = await searchParams;
  const gradeParam =
    typeof resolvedParams?.grade === "string"
      ? resolvedParams.grade
      : undefined;
  const selectedGrade = gradeParam
    ? GRADES.find((grade) => grade.value === gradeParam)
    : undefined;

  // Stats and topics are independent: fetch them together so the page
  // waits for one API round-trip, not two in a row.
  const [stats, { topics }] = await Promise.all([
    getPracticeStatistics(),
    selectedGrade
      ? getTopicsWithProgress(selectedGrade.value)
      : Promise.resolve({ topics: [] }),
  ]);
  return <Units stats={stats} topics={topics} />;
}
