import { notFound } from "next/navigation";

import { getPracticeStatistics } from "@/actions/attempt";
import Units from "./_components/units";
import { getTopicsWithProgress } from "@/lib/data/get-topics-with-progress";
import { getGradeBySlug } from "@/types/grade";

interface PracticePageProps {
  readonly params: Promise<{ grade: string }>;
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { grade } = await params;
  const selectedGrade = getGradeBySlug(grade);
  if (!selectedGrade) {
    notFound();
  }

  // Stats and topics are independent: fetch them together so the page
  // waits for one API round-trip, not two in a row.
  const [stats, { topics }] = await Promise.all([
    getPracticeStatistics(),
    getTopicsWithProgress(selectedGrade.value),
  ]);
  return <Units stats={stats} topics={topics} gradeLabel={selectedGrade.label} />;
}
