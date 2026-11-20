import Image from "next/image";
import { notFound } from "next/navigation";

import { UnitList } from "./_components/unit-list";
import { getGradeBySlug } from "@/types/grade";
import { getTopicsWithProgress } from "@/lib/data/get-topics-with-progress";
import { getLearningStatsByGrade } from "@/actions/learning-progress/stats-by-grade";

interface UnitsPageProps {
  readonly params: Promise<{ grade: string }>;
}

export default async function UnitsPage({ params }: UnitsPageProps) {
  const { grade } = await params;
  const selectedGrade = getGradeBySlug(grade);
  if (!selectedGrade) {
    notFound();
  }
  // Start the stats request now but don't wait on it: the strip streams in after the grid.
  const statsPromise = getLearningStatsByGrade(selectedGrade.value);
  const { topics } = await getTopicsWithProgress(selectedGrade.value);
  if (topics.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center rounded-[28px] bg-white px-6 py-12 text-center shadow-sheet-lime">
          <Image src="/mascot.svg" alt="" width={72} height={72} />
          <h1 className="mt-4 text-2xl font-black text-ink">Lớp này chưa có chủ đề nào</h1>
          <p className="mt-1 text-base font-extrabold text-sky-ink">No topics here yet.</p>
          <p className="mt-3 max-w-md text-base text-ink-body">
            Hãy chọn một lớp khác ở hàng nút phía trên.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <UnitList topics={topics} grade={selectedGrade.value} statsPromise={statsPromise} />
    </div>
  );
}
