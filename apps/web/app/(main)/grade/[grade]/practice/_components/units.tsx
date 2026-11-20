import Image from "next/image";

import { Unit } from "./unit";
import { PageHeading } from "@/components/page-heading";
import { TopicWithProgress } from "@/types/topic-with-progress";
import { PracticeStatistics } from "@/types";
import { AttemptStatistics } from "./attempt-statistics";

interface UnitsProps {
  readonly stats: PracticeStatistics;
  readonly topics: TopicWithProgress[];
  readonly gradeLabel: string;
}

export default function Units({ stats, topics, gradeLabel }: UnitsProps) {
  return (
    <div className="grid gap-x-6 gap-y-4 pb-10 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-8">
      <PageHeading
        id="practice-title"
        title={<>Luyện tập · {gradeLabel}</>}
        echo="Practise what you learned."
        className="lg:col-span-2"
      />
      <section className="flex min-w-0 flex-col gap-4" aria-labelledby="practice-title">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center rounded-[28px] bg-white px-6 py-12 text-center shadow-sheet-lime">
            <Image src="/mascot.svg" alt="" width={72} height={72} />
            <h2 className="mt-4 text-2xl font-black text-ink">Lớp này chưa có bài luyện tập</h2>
            <p className="mt-1 text-base font-extrabold text-sky-ink">No practice here yet.</p>
            <p className="mt-3 max-w-md text-base text-ink-body">
              Hãy chọn một lớp khác ở hàng nút phía trên.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Unit topic={topic} lessons={topic.lessons} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside className="mt-2 lg:mt-0" aria-label="Thống kê luyện tập">
        <div className="lg:sticky lg:top-6">
          <AttemptStatistics stats={stats} />
        </div>
      </aside>
    </div>
  );
}
