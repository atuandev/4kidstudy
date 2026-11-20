import { Suspense } from "react";
import { getFlashcardsByTopic } from "@/actions/flashcard";
import { Flashcard } from "@/types";
import { FlashcardsContent } from "./_components/flashcard-content";

interface FlashcardsTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function FlashcardsTopicPage({ params }: FlashcardsTopicPageProps) {
  const { topicId } = await params;
  // Active cards only: the saved resume index counts active cards, so the lists must match.
  const data = await getFlashcardsByTopic(parseInt(topicId, 10), true);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <FlashcardsContent data={data.payload as Flashcard[]} />
    </Suspense>
  );
}
