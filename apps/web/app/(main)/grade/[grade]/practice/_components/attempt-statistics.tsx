import { CheckCircleIcon, ClockIcon, GraduationCapIcon, XCircleIcon } from "@/components/icons";

import { PracticeStatistics } from "@/types";
import { cn } from "@/lib/utils";

interface AttemptStatisticsProps {
  stats: PracticeStatistics;
}

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

interface StatTileProps {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  readonly tone: string;
}

function StatTile({ label, value, icon: Icon, tone }: StatTileProps) {
  return (
    <div className="flex flex-col-reverse gap-1 rounded-2xl bg-wash px-3.5 py-3 lg:flex-row lg:items-center lg:justify-between">
      <dt className="flex flex-col items-start gap-1.5 text-sm font-bold leading-tight text-ink-body lg:flex-row lg:items-center lg:gap-2">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
          <Icon className="size-4" aria-hidden={true} />
        </span>
        {label}
      </dt>
      <dd className="text-xl font-black tabular-nums text-ink">{value}</dd>
    </div>
  );
}

/** The learner's practice totals: lessons done (with a bar), time, right and wrong answers. */
export function AttemptStatistics({ stats }: AttemptStatisticsProps) {
  const done = stats.completeLessonCount;
  const total = stats.totalLessonCount;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sheet-lime">
      <h2 className="text-xl font-black text-ink">Thống kê luyện tập</h2>
      <p className="text-sm font-extrabold text-sky-ink">Your practice so far</p>

      <div className="mt-4 rounded-2xl bg-leaf-wash px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-forest">
          <GraduationCapIcon className="size-4" aria-hidden="true" />
          Bài đã hoàn thành
        </p>
        <p className="mt-1 text-2xl font-black tabular-nums text-ink">
          {done}
          <span className="text-lg text-ink-body"> / {total}</span>
        </p>
        <div
          role="progressbar"
          aria-label="Bài đã hoàn thành"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="mt-2 h-3 overflow-hidden rounded-full bg-white"
        >
          <div className="h-full rounded-full bg-leaf" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <dl className="mt-2.5 grid grid-cols-3 gap-2.5 lg:grid-cols-1">
        <StatTile
          label="Thời gian"
          value={formatDuration(stats.totalDurationSec)}
          icon={ClockIcon}
          tone="bg-sky-wash text-sky-ink"
        />
        <StatTile
          label="Câu đúng"
          value={stats.totalCorrectCount}
          icon={CheckCircleIcon}
          tone="bg-leaf-wash text-forest"
        />
        <StatTile
          label="Câu sai"
          value={stats.totalIncorrectCount}
          icon={XCircleIcon}
          tone="bg-cherry-wash text-cherry-deep"
        />
      </dl>
    </div>
  );
}
