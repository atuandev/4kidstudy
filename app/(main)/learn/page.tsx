import { FeedWrapper } from "@/components/feed-wrapper";
import { LearnCard } from "./_components/learn-card";
import { StickyWrapper } from "@/components/sticky-wrapper";

export default function LearnPage() {
  return (
    <div className="flex flex-row-reverse gap-[48px]">
      <StickyWrapper></StickyWrapper>
      <FeedWrapper>
        <h1 className="text-2xl font-extrabold mb-4">Góc học tập</h1>
        <LearnCard
          title="Flashcards"
          description="Ôn tập từ vựng một cách hiệu quả với flashcards."
          href="/learn/flashcards"
        />
        <LearnCard
          title="Sentences"
          description="Ôn tập câu một cách hiệu quả với sentences."
          href="/learn/sentences"
        />
      </FeedWrapper>
    </div>
  );
}
