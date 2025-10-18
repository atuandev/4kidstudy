"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface LessonStatusChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

const chartConfig = {
  count: {
    label: "Số lượng",
    color: "hsl(var(--chart-1))",
  },
};

export function LessonStatusChart({ data }: LessonStatusChartProps) {
  const formattedData = data.map((item) => ({
    status:
      item.status === "PUBLISHED"
        ? "Đã hoạt động"
        : item.status === "DRAFT"
        ? "Nháp"
        : "Không hoạt động",
    count: item.count,
    fill:
      item.status === "PUBLISHED"
        ? "hsl(142, 76%, 36%)"
        : item.status === "DRAFT"
        ? "hsl(48, 96%, 53%)"
        : "hsl(0, 84%, 60%)",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trạng thái bài luyện tập</CardTitle>
        <CardDescription>Phân bố bài luyện tập theo trạng thái</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={formattedData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
