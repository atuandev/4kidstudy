import type { PropsWithChildren } from "react";

/**
 * Lessons run full screen, without the app sidebar: the only way out is the
 * header's exit button, which asks before throwing the attempt away.
 */
const LessonGroupLayout = ({ children }: PropsWithChildren) => {
  return <div className="min-h-dvh bg-lime text-ink">{children}</div>;
};

export default LessonGroupLayout;
