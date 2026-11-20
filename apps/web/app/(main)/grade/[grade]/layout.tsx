import type { ReactNode } from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { GradeSelectorButton } from "@/components/grade-selector-button";
import { getGradeBySlug } from "@/types/grade";

interface GradeLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ grade: string }>;
}

const GradeSelectorFallback = () => (
  <div className="mx-6 mb-4 h-10 animate-pulse rounded-md bg-muted" />
);

/**
 * Shared shell for every `/grade/[grade]/...` page: rejects unknown grades
 * and shows the grade selector above the page.
 */
export default async function GradeLayout({ children, params }: GradeLayoutProps) {
  const { grade } = await params;
  if (!getGradeBySlug(grade)) {
    notFound();
  }

  return (
    <>
      <Suspense fallback={<GradeSelectorFallback />}>
        <GradeSelectorButton />
      </Suspense>
      {children}
    </>
  );
}
