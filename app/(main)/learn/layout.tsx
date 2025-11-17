import type { PropsWithChildren } from "react";
import { Suspense } from "react";

import { GradeSelectorButton } from "@/components/grade-selector-button";

const GradeSelectorFallback = () => (
  <div className="mx-6 mb-4 h-10 animate-pulse rounded-md bg-muted" />
);

const LearnLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Suspense fallback={<GradeSelectorFallback />}>
        <GradeSelectorButton />
      </Suspense>
      {children}
    </>
  );
};

export default LearnLayout;
