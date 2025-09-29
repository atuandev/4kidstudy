"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGradeStore } from "@/lib/store";
import { getTopicsByGrade } from "@/actions/topic";
import { GRADES, type Grade } from "@/types/grade";

export function GradeSelectorButton() {
  const { selectedGradeData, setSelectedGrade, isLoading, setLoading } = useGradeStore();

  const handleGradeClick = async (grade: Grade) => {
    if (isLoading) return;
    
    setLoading(true);
    
    try {
      const response = await getTopicsByGrade(grade.value);
      const topics = Array.isArray(response.payload) ? response.payload : [];
      setSelectedGrade(grade.value, topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 pb-4">
      <GraduationCap className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1">
        {GRADES.map((grade) => (
          <Button
            key={grade.id}
            variant={selectedGradeData?.value === grade.value ? "default" : "ghost"}
            size="sm"
            className="h-8 px-3"
            disabled={isLoading}
            onClick={() => handleGradeClick(grade)}
          >
            {isLoading && selectedGradeData?.value === grade.value ? "..." : grade.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
