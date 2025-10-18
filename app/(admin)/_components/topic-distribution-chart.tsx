'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface TopicDistributionChartProps {
  data: {
    name: string;
    lessonCount: number;
  }[];
}

const chartConfig = {
  lessonCount: {
    label: 'Số bài học',
    color: 'hsl(280, 65%, 60%)',
  },
};

export function TopicDistributionChart({ data }: TopicDistributionChartProps) {
  const formattedData = data.map((item) => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
    lessonCount: item.lessonCount,
    fill: 'hsl(280, 65%, 60%)',
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phân bố chủ đề</CardTitle>
        <CardDescription>Số lượng bài học theo chủ đề</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={formattedData} accessibilityLayer layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={150}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="lessonCount" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

