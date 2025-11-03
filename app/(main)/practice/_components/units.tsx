"use client";

import { useGradeStore } from "@/lib/store";
import { Unit } from "./unit";
import { Topic, User, PracticeStatistics } from "@/types";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { AttemptStatistics } from "./attempt-statistics";

export default function Units({ profile, stats }: { profile: User; stats: PracticeStatistics }) {
  const { topics } = useGradeStore();

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <AttemptStatistics profile={profile} stats={stats} />
      </StickyWrapper>
      <FeedWrapper>
        {topics.map((topic: Topic) => (
          <div key={topic.id} className="mb-10">
            <Unit topic={topic} lessons={topic.lessons} />
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
}
