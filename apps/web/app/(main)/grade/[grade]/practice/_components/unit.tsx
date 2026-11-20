"use client";

import { useId, useState } from "react";
import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";
import { Lesson, Topic } from "@/types";

type UnitProps = {
  topic: Topic;
  lessons: Lesson[];
};

export const Unit = ({ topic, lessons }: UnitProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-sheet-lime">
      <UnitBanner
        topic={topic}
        lessonCount={lessons.length}
        isExpanded={isExpanded}
        controls={panelId}
        onClick={toggleExpanded}
      />

      {isExpanded && (
        <ol id={panelId} className="divide-y-2 divide-wash border-t-2 border-wash">
          {lessons.map((lesson, index) => {
            return (
              <li key={lesson.id}>
                <LessonButton id={lesson.id} lesson={lesson} position={index + 1} />
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
};
