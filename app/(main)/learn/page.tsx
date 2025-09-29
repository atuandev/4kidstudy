import { FeedWrapper } from "@/components/feed-wrapper";
import { LearnCard } from "./_components/learn-card";
import { StickyWrapper } from "@/components/sticky-wrapper";

export default function LearnPage() {
  return (
    <div className="flex flex-row-reverse gap-[48px]">
      <StickyWrapper>
      </StickyWrapper>
      <FeedWrapper>
        <h1 className="text-2xl font-extrabold mb-4">Góc học tập</h1>
        <LearnCard />
      </FeedWrapper>
    </div>
  );
}
