"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart as BarChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getXPStats } from "@/actions/leaderboard";

interface XPDataPoint {
  date: string;
  xpEarned: number;
}

const TIME_RANGES = [
  { value: "1", label: "Hôm nay" },
  { value: "3", label: "3 ngày" },
  { value: "7", label: "7 ngày" },
  { value: "14", label: "14 ngày" },
  { value: "30", label: "30 ngày" },
];

export function XPChart() {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<XPDataPoint[]>([]);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getXPStats(days);
      setData(result.data);
      setTotalXP(result.totalXP);
      setLoading(false);
    };

    fetchData();
  }, [days]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5 text-primary" />
            <CardTitle>Điểm kiếm được</CardTitle>
          </div>
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
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
        <div className="mt-2">
          <p className="text-2xl font-bold text-primary">{totalXP} XP</p>
          <p className="text-sm text-muted-foreground">
            Tổng điểm kiếm được
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Chưa có dữ liệu</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value as string);
                  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                }}
                formatter={(value: number) => [`${value} XP`, "Điểm"]}
              />
              <Legend />
              <Bar
                dataKey="xpEarned"
                fill="#82ca9d"
                name="XP kiếm được"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
