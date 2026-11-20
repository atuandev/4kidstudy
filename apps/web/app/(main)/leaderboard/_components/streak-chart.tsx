"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStreakStats } from "@/actions/leaderboard";
import { AXIS_TICK, ChartSheet, GRID_STROKE, TOOLTIP_PROPS } from "./chart-sheet";

interface StreakDataPoint {
  date: string;
  xpEarned: number;
}

const shortDate = (value: string) => {
  const date = new Date(value);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const longDate = (value: string) => {
  const date = new Date(value);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

/** XP earned each day over the chosen range, as columns (one per day). */
export function StreakChart() {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<StreakDataPoint[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getStreakStats(days);
      setData(result.data);
      setTotalXP(result.totalXP);
      setLoading(false);
    };

    fetchData();
  }, [days]);

  return (
    <ChartSheet
      titleId="streak-chart-title"
      title="Chuỗi ngày học"
      echo="XP earned each day"
      totalXP={totalXP}
      totalLabel="Tổng điểm kiếm được từ streak"
      days={days}
      onDaysChange={setDays}
      loading={loading}
      isEmpty={data.length === 0}
    >
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
              tickFormatter={shortDate}
            />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              {...TOOLTIP_PROPS}
              labelFormatter={(value) => longDate(value as string)}
              formatter={(value: number) => [`${value} XP`, "Điểm"]}
            />
            <Bar
              dataKey="xpEarned"
              fill="#16A34A"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>XP kiếm được mỗi ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">XP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{longDate(point.date)}</td>
              <td>{point.xpEarned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartSheet>
  );
}
