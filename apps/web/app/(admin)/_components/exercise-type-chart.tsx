'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Cell, Legend, Pie, PieChart } from 'recharts';

interface ExerciseTypeChartProps {
  data: {
    type: string;
    count: number;
  }[];
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 76%, 36%)',
  'hsl(48, 96%, 53%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 84%, 60%)',
];

const TYPE_LABELS: Record<string, string> = {
  SELECT_IMAGE: 'Chọn hình ảnh',
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  MATCHING: 'Ghép cặp',
  LISTENING: 'Nghe',
  PRONUNCIATION: 'Phát âm',
};

export function ExerciseTypeChart({ data }: ExerciseTypeChartProps) {
  const formattedData = data.map((item, index) => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = formattedData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loại câu hỏi luyện tập</CardTitle>
        <CardDescription>Phân bố câu hỏi luyện tập theo loại</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={formattedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

