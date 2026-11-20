"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { GRADES, GRADE_VALUES, type GradeValue } from "@/types/grade";

interface TopicDistributionChartProps {
  data: {
    name: string;
    grade: GradeValue;
    flashcardCount: number;
    sentenceImageCount: number;
    lessonCount: number;
  }[];
}

const chartConfig = {
  "Thẻ từ vựng": {
    label: "Thẻ từ vựng",
    color: "hsl(280, 65%, 60%)",
  },
  "Thẻ câu": {
    label: "Thẻ câu",
    color: "hsl(210, 65%, 60%)",
  },
  "Bài luyện tập": {
    label: "Bài luyện tập",
    color: "hsl(160, 65%, 60%)",
  },
};

export function TopicDistributionChart({ data }: TopicDistributionChartProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeValue>(GRADE_VALUES.GRADE_1);

  const filteredData = data.filter((item) => item.grade === selectedGrade);

  const formattedData = filteredData.map((item) => ({
    name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
    "Thẻ từ vựng": item.flashcardCount,
    "Thẻ câu": item.sentenceImageCount,
    "Bài luyện tập": item.lessonCount,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Phân bố chủ đề</CardTitle>
            <CardDescription>
              Số lượng thẻ từ vựng, thẻ câu và bài luyện tập theo chủ đề
            </CardDescription>
          </div>
          <Select
            value={selectedGrade}
            onValueChange={(value) => setSelectedGrade(value as GradeValue)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((grade) => (
                <SelectItem key={grade.id} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
            <Legend />
            <Bar
              dataKey="Bài luyện tập"
              fill={chartConfig["Bài luyện tập"].color}
              radius={[0, 4, 4, 0]}
            />
            <Bar dataKey="Thẻ câu" fill={chartConfig["Thẻ câu"].color} radius={[0, 4, 4, 0]} />
            <Bar
              dataKey="Thẻ từ vựng"
              fill={chartConfig["Thẻ từ vựng"].color}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
