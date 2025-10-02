import { Suspense } from "react";
import { SentencesHeader } from "./_components/header";
import { getSentenceImagesByTopicId } from "@/actions/sentence";
import { SentenceCard } from "./_components/sentence-card";

interface FlashcardsTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function FlashcardsTopicPage({
  params,
}: FlashcardsTopicPageProps) {
  const { topicId } = await params;
  const sentenceImages = await getSentenceImagesByTopicId(parseInt(topicId, 10));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SentencesHeader />
      <div className="space-y-6 pb-8">
        {sentenceImages.map((sentenceImage, index) => (
          <SentenceCard 
            key={sentenceImage.id} 
            sentenceImage={sentenceImage}
            autoPlay={index === 0}
          />
        ))}
      </div>
    </Suspense>
  );
}
