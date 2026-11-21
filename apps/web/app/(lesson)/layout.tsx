import type { PropsWithChildren } from "react";

const LessonGroupLayout = ({ children }: PropsWithChildren) => {
  return <div className="min-h-dvh bg-lime text-ink">{children}</div>;
};

export default LessonGroupLayout;
