import Image from "next/image";

import {
  ArrowCounterClockwiseIcon,
  ClockIcon,
  GraduationCapIcon,
  TargetIcon,
  TrophyIcon,
} from "@/components/icons";
import type {
  PracticeStatistics,
  PracticeStatisticsByType,
  PracticeStatisticsRecentAttempt,
} from "@/types";
import { EXERCISE_TYPES } from "@/lib/exercise-types";
import { cn } from "@/lib/utils";

interface AttemptStatisticsProps {
  readonly stats: PracticeStatistics;
}

type IconComponent = React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Learners are in Vietnam; the API buckets days on the same clock. */
const TIME_ZONE = "Asia/Ho_Chi_Minh";

const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

/** Splits seconds into a number and a Vietnamese unit, for a big number with a small unit. */
function splitDuration(totalSeconds: number): { value: string; unit: string } {
  if (totalSeconds < 60) return { value: String(totalSeconds), unit: "giây" };
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return { value: String(minutes), unit: "phút" };
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return { value: String(hours), unit: rest > 0 ? `giờ ${rest} phút` : "giờ" };
}

const dayMonthParts = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  timeZone: TIME_ZONE,
});

/** "20/11", in Vietnam time. */
function formatDayMonth(iso: string) {
  const parts = dayMonthParts.formatToParts(new Date(iso));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("day")}/${part("month")}`;
}

function SheetHeader({
  id,
  title,
  echo,
  aside,
}: {
  readonly id: string;
  readonly title: string;
  readonly echo: string;
  readonly aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 id={id} className="text-xl font-black text-ink">
          {title}
        </h2>
        <p className="text-sm font-extrabold text-sky-ink">{echo}</p>
      </div>
      {aside}
    </div>
  );
}

function Sheet({
  labelledBy,
  className,
  children,
}: {
  readonly labelledBy: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("rounded-[28px] bg-white p-5 shadow-sheet-lime", className)}
    >
      {children}
    </section>
  );
}

interface StatTileProps {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly unit?: string;
  readonly icon: IconComponent;
  readonly tone: string;
}

function StatTile({ label, value, unit, icon: Icon, tone }: StatTileProps) {
  return (
    <div className="flex flex-col-reverse gap-1.5 rounded-2xl bg-wash px-3.5 py-3">
      <dt className="flex items-center gap-2 text-sm font-bold leading-tight text-ink-body">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
          <Icon className="size-4" aria-hidden={true} />
        </span>
        {label}
      </dt>
      <dd className="text-2xl font-black tabular-nums text-ink">
        {value}
        {unit ? <span className="ml-1 text-sm font-extrabold text-ink-body">{unit}</span> : null}
      </dd>
    </div>
  );
}

/** Lessons done, the headline numbers, and how the answers split. */
function OverviewSheet({ stats }: AttemptStatisticsProps) {
  const done = stats.completeLessonCount;
  const total = stats.totalLessonCount;
  const duration = splitDuration(stats.totalDurationSec);

  const firstTry = stats.totalCorrectCount - stats.totalCorrectOnSecondCount;
  const skipped = Math.min(stats.totalSkipCount, stats.totalIncorrectCount);
  const wrong = stats.totalIncorrectCount - skipped;
  const answers = stats.totalCorrectCount + stats.totalIncorrectCount;
  const segments = [
    { key: "first", label: "Đúng ngay", value: firstTry, swatch: "bg-leaf-deep" },
    {
      key: "second",
      label: "Đúng lần 2",
      value: stats.totalCorrectOnSecondCount,
      swatch: "bg-leaf",
    },
    { key: "wrong", label: "Sai", value: wrong, swatch: "bg-cherry" },
    { key: "skipped", label: "Bỏ qua", value: skipped, swatch: "bg-ink-meta" },
  ].filter((segment) => segment.key !== "skipped" || segment.value > 0);

  return (
    <Sheet labelledBy="practice-overview-title">
      <SheetHeader
        id="practice-overview-title"
        title="Thống kê luyện tập"
        echo="Your practice so far"
      />

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
          <div
            className="h-full rounded-full bg-leaf"
            style={{ width: `${Math.round(percent(done, total))}%` }}
          />
        </div>
        {stats.perfectLessonCount > 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-forest">
            <TrophyIcon className="size-4 text-sun-ink" aria-hidden="true" />
            {stats.perfectLessonCount} bài đạt điểm tối đa
          </p>
        ) : null}
      </div>

      <dl className="mt-2.5 grid grid-cols-2 gap-2.5">
        <StatTile
          label="Tỷ lệ đúng"
          value={Math.round(stats.accuracyPct)}
          unit="%"
          icon={TargetIcon}
          tone="bg-leaf-wash text-forest"
        />
        <StatTile
          label="Điểm đạt"
          value={Math.round(stats.scorePct)}
          unit="%"
          icon={TrophyIcon}
          tone="bg-sun-wash text-sun-ink"
        />
        <StatTile
          label="Thời gian"
          value={duration.value}
          unit={duration.unit}
          icon={ClockIcon}
          tone="bg-sky-wash text-sky-ink"
        />
        <StatTile
          label="Lượt luyện"
          value={stats.attemptCount}
          icon={ArrowCounterClockwiseIcon}
          tone="bg-white text-ink-body"
        />
      </dl>

      <div className="mt-4">
        <p className="text-sm font-extrabold text-ink">
          {answers} câu trả lời <span className="text-ink-body">· Answers</span>
        </p>
        <div
          aria-hidden="true"
          className="mt-2 flex h-3 gap-0.5 overflow-hidden rounded-full bg-wash"
        >
          {segments.map((segment) =>
            segment.value > 0 ? (
              <div
                key={segment.key}
                className={segment.swatch}
                style={{ width: `${percent(segment.value, answers)}%` }}
              />
            ) : null,
          )}
        </div>
        <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {segments.map((segment) => (
            <div key={segment.key} className="flex items-center justify-between gap-2">
              <dt className="flex items-center gap-2 text-sm font-bold text-ink-body">
                <span className={cn("size-2.5 shrink-0 rounded-full", segment.swatch)} />
                {segment.label}
              </dt>
              <dd className="text-sm font-black tabular-nums text-ink">{segment.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Sheet>
  );
}

/** Right answers out of all answers, per exercise type. */
function TypeSheet({ byType }: { readonly byType: PracticeStatisticsByType[] }) {
  return (
    <Sheet labelledBy="practice-types-title">
      <SheetHeader id="practice-types-title" title="Theo dạng bài" echo="By exercise type" />
      <ul className="mt-4 flex flex-col gap-3.5">
        {byType.map((row) => {
          const meta = EXERCISE_TYPES[row.type];
          const Icon = meta.icon;
          const answered = row.correctCount + row.incorrectCount;
          const accuracy = Math.round(percent(row.correctCount, answered));
          return (
            <li key={row.type} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  meta.tile,
                )}
              >
                <Icon className="size-5" aria-hidden={true} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-black text-ink" title={meta.en}>
                    {meta.vi}
                  </p>
                  <p className="shrink-0 text-sm font-black tabular-nums text-ink">
                    {answered > 0 ? `${accuracy}%` : <span className="text-ink-body">–</span>}
                  </p>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${meta.vi}: tỷ lệ đúng`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={accuracy}
                  className="mt-1 h-2 overflow-hidden rounded-full bg-wash"
                >
                  <div className="h-full rounded-full bg-leaf" style={{ width: `${accuracy}%` }} />
                </div>
                <p className="mt-0.5 text-xs font-bold text-ink-body">
                  {answered > 0 ? `${row.correctCount}/${answered} câu đúng` : "Chưa làm"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

const scoreTone = (accuracyPct: number) =>
  accuracyPct >= 80
    ? "bg-leaf-wash text-forest"
    : accuracyPct >= 50
      ? "bg-sun-wash text-sun-ink"
      : "bg-cherry-wash text-cherry-deep";

/** The latest finished lessons with their score. */
function RecentSheet({ attempts }: { readonly attempts: PracticeStatisticsRecentAttempt[] }) {
  return (
    <Sheet labelledBy="practice-recent-title">
      <SheetHeader id="practice-recent-title" title="Bài gần đây" echo="Recent lessons" />
      <ol className="mt-3 divide-y-2 divide-wash">
        {attempts.map((attempt) => (
          <li key={attempt.attemptId} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black leading-tight text-ink">
                {attempt.lessonTitle}
              </p>
              <p className="truncate text-xs font-bold text-ink-body">
                {formatDayMonth(attempt.createdAt)} · {attempt.topicTitle}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-sm font-black tabular-nums",
                scoreTone(attempt.accuracyPct),
              )}
              aria-label={`${attempt.totalScore} trên ${attempt.maxScore} điểm`}
            >
              {attempt.totalScore}/{attempt.maxScore}
            </span>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}

/** The learner's practice dashboard for one grade. */
export function AttemptStatistics({ stats }: AttemptStatisticsProps) {
  if (stats.attemptCount === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Sheet labelledBy="practice-overview-title" className="text-center">
          <Image src="/mascot.svg" alt="" width={56} height={56} className="mx-auto" />
          <h2 id="practice-overview-title" className="mt-3 text-xl font-black text-ink">
            Thống kê luyện tập
          </h2>
          <p className="text-sm font-extrabold text-sky-ink">Your practice so far</p>
          <p className="mt-3 text-base text-ink-body">
            Bé chưa hoàn thành bài nào ở lớp này. Làm xong một bài để xem thống kê nhé!
          </p>
          <p className="mt-3 rounded-2xl bg-wash px-3.5 py-2.5 text-sm font-bold text-ink-body">
            {stats.totalLessonCount} bài đang chờ bé
          </p>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <OverviewSheet stats={stats} />
      <TypeSheet byType={stats.byType} />
      {stats.recentAttempts.length > 0 ? <RecentSheet attempts={stats.recentAttempts} /> : null}
    </div>
  );
}
