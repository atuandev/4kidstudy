import { Suspense } from "react";

import { GradeSelectorButton } from "@/components/grade-selector-button";
import { PageHeading } from "@/components/page-heading";
import { LearnCard } from "./_components/learn-card";

const GradeSelectorFallback = () => (
  <div className="mb-6 h-11 animate-pulse rounded-chip bg-white/70 sm:mb-8" />
);

export default function LearnPage() {
  return (
    <>
      <Suspense fallback={<GradeSelectorFallback />}>
        <GradeSelectorButton />
      </Suspense>
      <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-10">
        <PageHeading title="Góc học tập" echo="Learning corner" />
        <LearnCard
          title="Chủ đề"
          description="Xem tất cả các chủ đề học tập theo lớp học."
          href="/learn/units"
        />
      </div>
    </>
  );
}
