import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { LearnCard } from "./units/_components/learn-card";

export default function LearnPage() {
  return (
    <div className="flex flex-row-reverse gap-[48px]">
      <StickyWrapper></StickyWrapper>
      <FeedWrapper>
        <h1 className="text-2xl font-extrabold mb-4">Góc học tập</h1>
        <LearnCard
          title="Chủ đề"
          description="Xem tất cả các chủ đề học tập theo lớp học."
          href="/learn/units"
        />
      </FeedWrapper>
    </div>
  );
}
