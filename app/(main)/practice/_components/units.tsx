"use client";

import { useGradeStore } from "@/lib/store";
import { Unit } from "./unit";
import { Topic } from "@/types";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";

export default function Units() {
  const { topics } = useGradeStore();
  
  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
      </StickyWrapper>
      <FeedWrapper>
        {topics.map((topic: Topic) => (
          <div key={topic.id} className="mb-10">
            <Unit
              topic={topic}
              lessons={topic.lessons}
              activeLessonPercentage={0}
            />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
}
