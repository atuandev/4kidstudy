import type { PropsWithChildren } from "react";

import { GradeSelectorButton } from "@/components/grade-selector-button";

const LearnLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <GradeSelectorButton />
      {children}
    </>
  );
};

export default LearnLayout;
