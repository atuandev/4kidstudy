"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDailyPracticeStats } from "@/actions/attempt";
import { cn } from "@/lib/utils";
import type { DailyPracticeStats } from "@/types";
import { AXIS_TICK, ChartSheet, GRID_STROKE, TOOLTIP_PROPS } from "./chart-sheet";

const LEAF_DEEP = "#16A34A";
const SKY_DEEP = "#0284C7";

const EMPTY: DailyPracticeStats = { days: 7, data: [] };

const shortDate = (value: string) => {
  const [, month, day] = value.split("-");
  return `${Number(day)}/${Number(month)}`;
};

const longDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
};

const accuracy = (correct: number, incorrect: number) =>
  correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : null;

function usePracticeStats(days: number) {
  const [loaded, setLoaded] = useState<{ days: number; stats: DailyPracticeStats } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDailyPracticeStats(days).then((stats) => {
      if (!cancelled) setLoaded({ days, stats });
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return { stats: loaded?.stats ?? EMPTY, loading: loaded?.days !== days };
}

type View = "time" | "accuracy" | "lessons";

const VIEWS: {
  value: View;
  label: string;
  echo: string;
  unit: string;
  totalLabel: string;
}[] = [
  {
    value: "time",
    label: "Thời gian",
    echo: "Minutes practised each day",
    unit: "phút",
    totalLabel: "Tổng thời gian luyện tập",
  },
  {
    value: "accuracy",
    label: "Tỷ lệ đúng",
    echo: "Right answers each day",
    unit: "%",
    totalLabel: "Tỷ lệ trả lời đúng trong khoảng này",
  },
  {
    value: "lessons",
    label: "Số bài",
    echo: "Lessons finished each day",
    unit: "bài",
    totalLabel: "Số bài đã hoàn thành",
  },
];

function ViewTabs({
  value,
  onChange,
}: {
  readonly value: View;
  readonly onChange: (view: View) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Chọn biểu đồ luyện tập"
      className="inline-flex flex-wrap rounded-2xl bg-wash p-1"
    >
      {VIEWS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 rounded-xl px-3.5 text-sm font-black transition-colors outline-none focus-visible:ring-4 focus-visible:ring-sky/50",
            value === option.value
              ? "bg-white text-ink shadow-[0_2px_0_#E2E8F0]"
              : "text-ink-body hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PracticeChart() {
  const [days, setDays] = useState<number>(7);
  const [view, setView] = useState<View>("time");
  const { stats, loading } = usePracticeStats(days);
  const meta = VIEWS.find((option) => option.value === view) ?? VIEWS[0];

  const rows = stats.data.map((day) => ({
    date: day.date,
    minutes: Math.round(day.durationSec / 6) / 10,
    lessons: day.attemptCount,
    accuracy: accuracy(day.correctCount, day.incorrectCount),
  }));

  const sum = (key: "durationSec" | "attemptCount" | "correctCount" | "incorrectCount") =>
    stats.data.reduce((total, day) => total + day[key], 0);
  const lessons = sum("attemptCount");
  const totals: Record<View, number> = {
    time: Math.round(sum("durationSec") / 60),
    accuracy: accuracy(sum("correctCount"), sum("incorrectCount")) ?? 0,
    lessons,
  };

  return (
    <ChartSheet
      titleId="practice-chart-title"
      title="Luyện tập mỗi ngày"
      echo={meta.echo}
      total={totals[view]}
      unit={meta.unit}
      totalLabel={meta.totalLabel}
      days={days}
      onDaysChange={setDays}
      loading={loading}
      isEmpty={lessons === 0}
      toolbar={<ViewTabs value={view} onChange={setView} />}
    >
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={260}>
          {view === "accuracy" ? (
            <LineChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}%`}
              />
              <Tooltip
                {...TOOLTIP_PROPS}
                cursor={{ stroke: GRID_STROKE, strokeWidth: 2 }}
                labelFormatter={(value) => longDate(value as string)}
                formatter={(value: number) => [`${value}%`, "Tỷ lệ đúng"]}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={LEAF_DEEP}
                strokeWidth={3}
                dot={{ r: 4, fill: LEAF_DEEP, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls
                animationDuration={500}
              />
            </LineChart>
          ) : (
            <BarChart data={rows} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
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
                {...TOOLTIP_PROPS}
                labelFormatter={(value) => longDate(value as string)}
                formatter={(value: number) =>
                  view === "time" ? [`${value} phút`, "Thời gian"] : [`${value} bài`, "Số bài"]
                }
              />
              <Bar
                dataKey={view === "time" ? "minutes" : "lessons"}
                fill={view === "time" ? SKY_DEEP : LEAF_DEEP}
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                animationDuration={500}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Luyện tập mỗi ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">Thời gian (phút)</th>
            <th scope="col">Tỷ lệ đúng</th>
            <th scope="col">Số bài</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date}>
              <td>{longDate(row.date)}</td>
              <td>{row.minutes}</td>
              <td>{row.accuracy === null ? "–" : `${row.accuracy}%`}</td>
              <td>{row.lessons}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartSheet>
  );
}
