import Link from "next/link";

import { cn } from "@/lib/utils";
import { GRADES, getGradeSlug } from "@/types/grade";

interface GradePickerProps {
  readonly size?: "default" | "lg";
  readonly className?: string;
}

export function GradePicker({ size = "default", className }: GradePickerProps) {
  return (
    <ul
      className={cn(
        size === "lg" ? "flex flex-wrap gap-3" : "grid max-w-[28rem] grid-cols-5 gap-2 sm:gap-2.5",
        className,
      )}
    >
      {GRADES.map((grade) => (
        <li key={grade.id}>
          <Link
            href={`/register?grade=${getGradeSlug(grade.value)}`}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-2xl border-2 border-b-4 border-slate-200 bg-white font-black text-ink transition-colors",
              "hover:border-sky hover:bg-sky-50 hover:text-sky-ink active:translate-y-0.5 active:border-b-2",
              "outline-none focus-visible:ring-4 focus-visible:ring-sky/50",
              size === "lg"
                ? "h-16 min-w-24 px-5 text-xl"
                : "h-11 w-full px-1 text-sm sm:h-12 sm:text-base",
            )}
          >
            {grade.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
