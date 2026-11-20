"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TIME_RANGES = [
  { value: "1", label: "Hôm nay" },
  { value: "3", label: "3 ngày" },
  { value: "7", label: "7 ngày" },
  { value: "14", label: "14 ngày" },
  { value: "30", label: "30 ngày" },
];

/** Axis and grid styling shared by every chart: recessive, in text tokens. */
export const AXIS_TICK = { fontSize: 13, fill: "#475569", fontWeight: 700 };
export const GRID_STROKE = "#E2E8F0";
export const TOOLTIP_PROPS = {
  cursor: { fill: "#F1F5F9" },
  contentStyle: {
    borderRadius: 16,
    border: "2px solid #E2E8F0",
    boxShadow: "0 16px 24px -12px rgb(61 70 93 / 0.35)",
    fontWeight: 700,
    color: "#3D465D",
  },
  labelStyle: { fontWeight: 900, color: "#3D465D" },
  itemStyle: { color: "#3D465D" },
} as const;

interface ChartSheetProps {
  readonly titleId: string;
  readonly title: string;
  readonly echo: string;
  readonly total: React.ReactNode;
  /** Unit after the total; XP unless set. */
  readonly unit?: string;
  readonly totalLabel: string;
  readonly days: number;
  readonly onDaysChange: (days: number) => void;
  readonly loading: boolean;
  readonly isEmpty: boolean;
  /** Optional controls between the total and the plot, such as a view switch. */
  readonly toolbar?: React.ReactNode;
  readonly children: React.ReactNode;
}

/** A white sheet holding one chart: title, range picker, the headline total, then the plot. */
export function ChartSheet({
  titleId,
  title,
  echo,
  total,
  unit = "XP",
  totalLabel,
  days,
  onDaysChange,
  loading,
  isEmpty,
  toolbar,
  children,
}: ChartSheetProps) {
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-[28px] bg-white p-5 shadow-sheet-lime sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-xl font-black text-ink">
            {title}
          </h2>
          <p className="text-sm font-extrabold text-sky-ink">{echo}</p>
        </div>
        <Select value={days.toString()} onValueChange={(value) => onDaysChange(parseInt(value))}>
          <SelectTrigger className="w-[140px]" aria-label="Khoảng thời gian">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mt-3 text-3xl font-black tabular-nums text-ink">
        {total} <span className="text-lg text-ink-body">{unit}</span>
      </p>
      <p className="text-sm font-bold text-ink-body">{totalLabel}</p>

      {toolbar ? <div className="mt-4">{toolbar}</div> : null}

      <div className="mt-4">
        {loading ? (
          <div
            role="status"
            className="flex h-[260px] items-center justify-center rounded-2xl bg-wash text-base font-bold text-ink-body"
          >
            Đang tải...
          </div>
        ) : isEmpty ? (
          <div className="flex h-[260px] flex-col items-center justify-center rounded-2xl bg-wash text-center">
            <p className="text-base font-black text-ink">Chưa có bài nào trong khoảng này</p>
            <p className="text-sm font-bold text-ink-body">
              Học một bài là biểu đồ sẽ có cột đầu tiên.
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
