"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getStreakStats, getTopicXPStats } from "@/actions/leaderboard";
import { cn } from "@/lib/utils";
import { AXIS_TICK, ChartSheet, GRID_STROKE, TOOLTIP_PROPS } from "./chart-sheet";

interface DayPoint {
  date: string;
  xpEarned: number;
}

/** A day or topic with the class average beside the learner's own XP. */
interface DayRow extends DayPoint {
  classAverage: number;
}

interface TopicRow {
  topicId: number;
  topicTitle: string;
  xpEarned: number;
  classAverage: number;
}

interface ClassStats {
  learnerCount: number;
  averageXP: number;
}

/** Average per learner, rounded; the class includes the learner. */
const perLearner = (total: number, learnerCount: number) =>
  learnerCount > 0 ? Math.round(total / learnerCount) : 0;

type View = "day" | "topic";

const VIEWS: { value: View; label: string }[] = [
  { value: "day", label: "Theo ngày" },
  { value: "topic", label: "Theo chủ đề" },
];

/** The learner's series and the class average series. */
// Each series' label, legend text and tooltip row use the series' own colour,
// so these are the text-safe shades (Forest, Sky Ink: at least 4.5:1 on white)
// rather than the lighter Leaf Deep and Sky Deep. The class average is Sun Ink,
// the same colour as the "Trung bình lớp" pill text, everywhere it appears.
const DAY_FILL = "#15803D";
const TOPIC_FILL = "#0369A1";
const CLASS_STROKE = "#7A4A00";

/** Tooltip rows take their series' colour instead of the shared ink. */
const SERIES_TOOLTIP_PROPS = {
  ...TOOLTIP_PROPS,
  itemStyle: { fontWeight: 800 },
} as const;

/** Row height per topic: a 24px bar plus air. */
const ROW_HEIGHT = 44;

// Streak days are stored as UTC dates (YYYY-MM-DD), so read them in UTC.
const shortDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
};

const longDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
};

/** Every day in the range, oldest first, with 0 XP on days without practice. */
function fillDays(
  points: DayPoint[],
  gradePoints: DayPoint[],
  learnerCount: number,
  days: number,
): DayRow[] {
  const xpByDate = new Map(points.map((point) => [point.date, point.xpEarned]));
  const gradeXpByDate = new Map(gradePoints.map((point) => [point.date, point.xpEarned]));
  const today = new Date();
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - (days - 1 - index),
      ),
    );
    const date = day.toISOString().slice(0, 10);
    return {
      date,
      xpEarned: xpByDate.get(date) ?? 0,
      classAverage: perLearner(gradeXpByDate.get(date) ?? 0, learnerCount),
    };
  });
}

/**
 * XP earned over the chosen range, in one sheet: by day as columns, or by
 * topic as horizontal bars. Both views split the same XP, so they share the
 * range and the total.
 */
export function XPChart() {
  const [days, setDays] = useState<number>(7);
  const [view, setView] = useState<View>("day");
  const [byDay, setByDay] = useState<DayRow[]>([]);
  const [byTopic, setByTopic] = useState<TopicRow[]>([]);
  const [classStats, setClassStats] = useState<ClassStats>({ learnerCount: 0, averageXP: 0 });
  const [totalXP, setTotalXP] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      const [dayStats, topicStats] = await Promise.all([
        getStreakStats(days),
        getTopicXPStats(days),
      ]);
      if (cancelled) return;
      const learnerCount = dayStats.gradeLearnerCount;
      setByDay(fillDays(dayStats.data, dayStats.gradeData, learnerCount, days));
      setByTopic(
        topicStats.data.map((topic) => ({
          topicId: topic.topicId,
          topicTitle: topic.topicTitle,
          xpEarned: topic.xpEarned,
          classAverage: perLearner(topic.gradeXpEarned, learnerCount),
        })),
      );
      setClassStats({ learnerCount, averageXP: dayStats.gradeAverageXP });
      setTotalXP(dayStats.totalXP);
      setLoading(false);
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [days]);

  // Draw the class line whenever the grade has learners; with only the
  // learner in it, the line sits on their own bars and the pill says so.
  const showClass = classStats.learnerCount > 0;
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="tablist"
        aria-label="Cách xem điểm XP"
        className="inline-flex rounded-2xl bg-wash p-1"
      >
        {VIEWS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={view === option.value}
            onClick={() => setView(option.value)}
            className={cn(
              "h-9 rounded-xl px-3.5 text-sm font-black transition-colors outline-none focus-visible:ring-4 focus-visible:ring-sky/50",
              view === option.value
                ? "bg-white text-ink shadow-[0_2px_0_#E2E8F0]"
                : "text-ink-body hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ClassComparison classStats={classStats} />
    </div>
  );

  return (
    <ChartSheet
      titleId="xp-chart-title"
      title="Điểm XP"
      echo={view === "day" ? "XP earned each day" : "XP by topic"}
      total={totalXP}
      totalLabel="Tổng điểm kiếm được từ bài học"
      days={days}
      onDaysChange={setDays}
      loading={loading}
      isEmpty={totalXP === 0 && byTopic.length === 0}
      toolbar={toolbar}
    >
      {view === "day" ? (
        <DayBars data={byDay} showClass={showClass} />
      ) : (
        <TopicBars data={byTopic} showClass={showClass} />
      )}
    </ChartSheet>
  );
}

/**
 * The class average, in the same Sun Ink as the class line on the chart; a
 * note instead when nobody else is in the grade.
 */
function ClassComparison({ classStats }: { readonly classStats: ClassStats }) {
  if (classStats.learnerCount <= 1) {
    return (
      <p className="rounded-full bg-sun-wash px-3 py-1.5 text-sm font-bold text-sun-ink">
        Chưa có bạn cùng lớp để so sánh
      </p>
    );
  }
  return (
    <p className="rounded-full bg-sun-wash px-3 py-1.5 text-sm font-bold text-sun-ink">
      Trung bình lớp: <span className="font-black tabular-nums">{classStats.averageXP} XP</span> ·{" "}
      {classStats.learnerCount} bạn
    </p>
  );
}

/** Tooltip rows: one per series, each named. */
const xpTooltip = (value: number, name: string) => [`${value} XP`, name];

/** Names the two series: the learner's bars and the class average mark. */
function ChartLegend({ fill, mark }: { readonly fill: string; readonly mark: "line" | "tick" }) {
  return (
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-black">
      <li className="flex items-center gap-2" style={{ color: fill }}>
        <span className="size-3 rounded-[3px]" style={{ backgroundColor: fill }} />
        Bạn
      </li>
      <li className="flex items-center gap-2" style={{ color: CLASS_STROKE }}>
        {mark === "line" ? (
          <svg width="22" height="6" aria-hidden="true">
            <line
              x1="1"
              y1="3"
              x2="21"
              y2="3"
              stroke={CLASS_STROKE}
              strokeWidth="2.5"
              strokeDasharray="5 3"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: CLASS_STROKE }} />
        )}
        Trung bình lớp
      </li>
    </ul>
  );
}

/** The class average on a topic: a short upright tick across the topic's row. */
function AverageTick({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx === undefined || cy === undefined) return null;
  return <rect x={cx - 2} y={cy - 14} width={4} height={28} rx={2} fill={CLASS_STROKE} />;
}

function DayBars({ data, showClass }: { readonly data: DayRow[]; readonly showClass: boolean }) {
  return (
    <>
      <div aria-hidden="true">
        {showClass ? <ChartLegend fill={DAY_FILL} mark="line" /> : null}
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
              tickFormatter={shortDate}
              interval="preserveStartEnd"
              minTickGap={8}
            />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              {...SERIES_TOOLTIP_PROPS}
              labelFormatter={(value) => longDate(value as string)}
              formatter={xpTooltip}
            />
            <Bar
              dataKey="xpEarned"
              name="Bạn"
              fill={DAY_FILL}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              animationDuration={500}
            />
            {showClass ? (
              <Line
                type="monotone"
                dataKey="classAverage"
                name="Trung bình lớp"
                stroke={CLASS_STROKE}
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={{ r: 3, fill: CLASS_STROKE, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                animationDuration={500}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>XP kiếm được mỗi ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">XP</th>
            {showClass ? <th scope="col">Trung bình lớp (XP)</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{longDate(point.date)}</td>
              <td>{point.xpEarned}</td>
              {showClass ? <td>{point.classAverage}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function TopicBars({
  data,
  showClass,
}: {
  readonly data: TopicRow[];
  readonly showClass: boolean;
}) {
  return (
    <>
      <div aria-hidden="true">
        {showClass ? <ChartLegend fill={TOPIC_FILL} mark="tick" /> : null}
        <ResponsiveContainer width="100%" height={Math.max(120, data.length * ROW_HEIGHT + 40)}>
          <ComposedChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
            <XAxis
              type="number"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="topicTitle"
              width={150}
              tick={{ ...AXIS_TICK, fill: "#3D465D" }}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
              tickFormatter={(value: string) =>
                value.length > 20 ? `${value.slice(0, 19)}…` : value
              }
            />
            <Tooltip
              {...SERIES_TOOLTIP_PROPS}
              formatter={xpTooltip}
              labelFormatter={(label) => `Chủ đề: ${label}`}
            />
            <Bar
              dataKey="xpEarned"
              name="Bạn"
              fill={TOPIC_FILL}
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
              animationDuration={500}
            />
            {showClass ? (
              // Topics are separate, so no joining line: a tick per topic.
              <Line
                dataKey="classAverage"
                name="Trung bình lớp"
                stroke={CLASS_STROKE}
                strokeWidth={0}
                dot={<AverageTick />}
                activeDot={<AverageTick />}
                isAnimationActive={false}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>XP kiếm được theo chủ đề</caption>
        <thead>
          <tr>
            <th scope="col">Chủ đề</th>
            <th scope="col">XP</th>
            {showClass ? <th scope="col">Trung bình lớp (XP)</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.topicId}>
              <td>{point.topicTitle}</td>
              <td>{point.xpEarned}</td>
              {showClass ? <td>{point.classAverage}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
