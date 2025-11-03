"use client";

import { useState } from "react";
import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";
import { Lesson, Topic } from "@/types";

type UnitProps = {
  topic: Topic;
  lessons: Lesson[];
};

export const Unit = ({ topic, lessons }: UnitProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="bg-green-50 rounded-2xl border-2 border-green-600">
      <UnitBanner
        topic={topic}
        isExpanded={isExpanded}
        onClick={toggleExpanded}
      />

      {isExpanded && (
        <div className="space-y-2 p-4">
          {lessons.map((lesson) => {
            return (
              <LessonButton key={lesson.id} id={lesson.id} lesson={lesson} />
            );
          })}
        </div>
      )}
    </div>
  );
};
