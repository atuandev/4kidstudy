"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getTopicXPStats } from "@/actions/leaderboard";
import { AXIS_TICK, ChartSheet, GRID_STROKE, TOOLTIP_PROPS } from "./chart-sheet";

interface TopicXPDataPoint {
  topicId: number;
  topicTitle: string;
  xpEarned: number;
}

/** Row height per topic: a 24px bar plus air. */
const ROW_HEIGHT = 44;

/** XP per topic over the chosen range, as horizontal bars so long topic names stay readable. */
export function XPChart() {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<TopicXPDataPoint[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getTopicXPStats(days);
      setData(result.data);
      setTotalXP(result.totalXP);
      setLoading(false);
    };

    fetchData();
  }, [days]);

  return (
    <ChartSheet
      titleId="xp-chart-title"
      title="Điểm XP theo chủ đề"
      echo="XP by topic"
      totalXP={totalXP}
      totalLabel="Tổng điểm kiếm được từ bài học"
      days={days}
      onDaysChange={setDays}
      loading={loading}
      isEmpty={data.length === 0}
    >
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={Math.max(120, data.length * ROW_HEIGHT + 40)}>
          <BarChart
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
              {...TOOLTIP_PROPS}
              formatter={(value: number) => [`${value} XP`, "Điểm"]}
              labelFormatter={(label) => `Chủ đề: ${label}`}
            />
            <Bar
              dataKey="xpEarned"
              fill="#0284C7"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>XP kiếm được theo chủ đề</caption>
        <thead>
          <tr>
            <th scope="col">Chủ đề</th>
            <th scope="col">XP</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.topicId}>
              <td>{point.topicTitle}</td>
              <td>{point.xpEarned}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartSheet>
  );
}
