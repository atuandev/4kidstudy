"use client";

import { useGradeStore } from "@/lib/store";
import { UnitBanner } from "./unit-banner";
import { Unit } from "./unit";
import { Topic } from "@/types";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";

export default function Units() {
  const { selectedGrade, selectedGradeData, topics } = useGradeStore();

  if (!selectedGrade || !selectedGradeData) {
    return <div>No grade selected</div>;
  }

  if (topics.length === 0) {
    return <div>No topics found</div>;
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
      </StickyWrapper>
      <FeedWrapper>
        {topics.map((topic: Topic) => (
          <div key={topic.id} className="mb-10">
            <Unit
              order={topic.order}
              title={topic.title}
              description={topic.description || ""}
              lessons={topic.lessons}
              activeLessonPercentage={topic.activeLessonPercentage || 0}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
}
