import { LessonButton } from "./lesson-button";
import { UnitBanner } from "./unit-banner";
import { Lesson, Topic } from "@/types";

type UnitProps = {
  topic: Topic;
  lessons: Lesson[];
  activeLessonPercentage: number;
};

export const Unit = ({ topic, lessons, activeLessonPercentage }: UnitProps) => {
  return (
    <>
      <UnitBanner topic={topic} />

      <div className="relative flex flex-col items-center">
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
    </>
  );
};
