"use client";

import { FireIcon, TrophyIcon } from "@/components/icons";

import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

/** XP and streak pills; `compact` drops the unit words for the phone header. */
export function LearnerStats({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { profile } = useProfile();
  const pill = cn(
    "inline-flex items-center gap-1.5 rounded-full border-2 border-edge bg-white",
    compact ? "h-10 pl-1.5 pr-3" : "h-11 pl-2 pr-3.5",
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={pill}>
        <TrophyIcon size={22} weight="duotone" className="text-sun-deep" aria-hidden="true" />
        <span className="text-lg font-black tabular-nums text-ink">
          {profile ? profile.xp.toLocaleString("vi-VN") : "–"}
        </span>
        <span className={cn("text-sm font-extrabold text-ink-body", compact && "sr-only")}>XP</span>
      </span>
      <span className={pill}>
        <FireIcon size={22} weight="duotone" className="text-tangerine" aria-hidden="true" />
        <span className="text-lg font-black tabular-nums text-ink">
          {profile ? profile.streakDays : "–"}
        </span>
        <span className={cn("text-sm font-extrabold text-ink-body", compact && "sr-only")}>
          ngày
        </span>
      </span>
    </div>
  );
}
