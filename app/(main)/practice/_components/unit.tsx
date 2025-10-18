'use client';

import { useState } from "react";
import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";
import { Lesson, Topic } from "@/types";

type UnitProps = {
  topic: Topic;
  lessons: Lesson[];
  activeLessonPercentage: number;
};

export const Unit = ({ topic, lessons, activeLessonPercentage }: UnitProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="bg-green-50 rounded-2xl border-2 border-green-600">
      <UnitBanner topic={topic} isExpanded={isExpanded} onClick={toggleExpanded} />

      {isExpanded && (
        <div className="relative flex flex-col items-center pb-4">
          {lessons.map((lesson, i) => {
            // const isCurrent = lesson.id === 1;
            // const isLocked = !lesson.completed && !isCurrent;

            return (
              <LessonButton
                key={lesson.id}
                id={lesson.id}
                index={i}
                totalCount={lessons.length - 1}
                // current={isCurrent}
                // locked={isLocked}
                percentage={activeLessonPercentage}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
