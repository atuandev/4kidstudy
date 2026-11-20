import { CheckCircleIcon, Clock, InfinityIcon, SkipForward, Target, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

type ResultCardProps = {
  value: number;
  variant: "points" | "duration" | "accuracy" | "correct" | "skipped";
};

const CONFIG = {
  points: { title: "Tổng điểm", en: "Points", icon: Trophy, tone: "text-sun-ink bg-sun-wash" },
  duration: { title: "Thời gian", en: "Time", icon: Clock, tone: "text-sky-ink bg-sky-wash" },
  accuracy: { title: "Tỷ lệ đúng", en: "Accuracy", icon: Target, tone: "text-forest bg-leaf-wash" },
  correct: {
    title: "Số câu đúng",
    en: "Correct",
    icon: CheckCircleIcon,
    tone: "text-forest bg-leaf-wash",
  },
  skipped: {
    title: "Bỏ qua",
    en: "Skipped",
    icon: SkipForward,
    tone: "text-cherry-deep bg-cherry-wash",
  },
} as const;

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

/** One result tile on the finish sheet: icon, Vietnamese label with English echo, value. */
export const ResultCard = ({ value, variant }: ResultCardProps) => {
  const config = CONFIG[variant];
  const Icon = config.icon;

  let display: React.ReactNode = value;
  if (value === Infinity)
    display = <InfinityIcon className="size-7 stroke-[3]" aria-label="Không giới hạn" />;
  else if (variant === "duration") display = formatDuration(value);
  else if (variant === "accuracy") display = `${value}%`;

  return (
    <div className="flex flex-col-reverse gap-1 rounded-2xl bg-wash px-4 py-3.5 text-left">
      <dt className="text-sm font-bold leading-tight text-ink-body">{config.title}</dt>
      <dd className="flex items-center gap-2 text-2xl font-black tabular-nums text-ink">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            config.tone,
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {display}
      </dd>
    </div>
  );
};
