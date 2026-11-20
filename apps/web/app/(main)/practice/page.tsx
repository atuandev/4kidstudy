import { getPracticeStatistics } from "@/actions/attempt";
import Units from "./_components/units";
import { getTopicsWithProgress } from "@/lib/data/get-topics-with-progress";
import { GRADES } from "@/types/grade";

interface PracticePageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const [stats, resolvedParams] = await Promise.all([getPracticeStatistics(), searchParams]);
  const gradeParam = typeof resolvedParams?.grade === "string" ? resolvedParams.grade : undefined;
  const selectedGrade = gradeParam ? GRADES.find((grade) => grade.value === gradeParam) : undefined;
  if (!selectedGrade) {
    return <Units stats={stats} topics={[]} />;
  }
  const { topics } = await getTopicsWithProgress(selectedGrade.value);
  return <Units stats={stats} topics={topics} />;
}
