
import { LessonButton } from "./lesson-button"
import { UnitBanner } from "./unit-banner";
import { Lesson } from "@/types";

type UnitProps = {
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
  activeLessonPercentage: number;
};

export const Unit = ({
  order,
  title,
  description,
  lessons,
  activeLessonPercentage,
}: UnitProps) => {
  return (
    <>
      <UnitBanner title={title} description={description} order={order} />

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