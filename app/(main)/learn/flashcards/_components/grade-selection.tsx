"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTopicsByGrade } from "@/actions/topic";
import { Grade, GRADES } from "@/types";

interface GradeSelectionProps {
  onGradeSelect: (grade: string, topics: any[]) => void;
}

export function GradeSelection({ onGradeSelect }: GradeSelectionProps) {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGradeClick = async (grade: Grade) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSelectedGrade(grade.value);
    
    try {
      const response = await getTopicsByGrade(grade.value);
      const topics = Array.isArray(response.payload) ? response.payload : [];
      onGradeSelect(grade.value, topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Chọn lớp học</h2>
        <p className="text-muted-foreground">
          Chọn lớp học để xem các chủ đề phù hợp
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GRADES.map((grade) => (
          <Card
            key={grade.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGrade === grade.value
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => handleGradeClick(grade)}
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold">{grade.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {grade.description}
              </p>
              <Button
                variant={selectedGrade === grade.value ? "default" : "primary"}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && selectedGrade === grade.value ? "Đang tải..." : "Chọn"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
