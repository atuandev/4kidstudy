import { Suspense } from "react";
import { getFlashcardsByTopic } from "@/actions/flashcard";
import { Flashcard } from "@/types";
import { FlashcardsContent } from "./_components/flashcard-content";
import { FlashcardsHeader } from "./_components/header";

interface FlashcardsTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function FlashcardsTopicPage({
  params,
}: FlashcardsTopicPageProps) {
  const { topicId } = await params;
  const data = await getFlashcardsByTopic(parseInt(topicId, 10));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <FlashcardsHeader />
      <FlashcardsContent data={data.payload as Flashcard[]} />
    </Suspense>
  );
}
