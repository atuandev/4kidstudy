import { Suspense } from "react";
import { getSentenceImagesByTopicId } from "@/actions/sentence";
import { SentenceViewer } from "./_components/sentence-viewer";
import { getTopicById } from "@/actions/topic";
import { reviewContent } from '@/actions/learning-progress';

interface SentencesTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function SentencesTopicPage({
  params,
}: SentencesTopicPageProps) {
  const { topicId } = await params;
  const sentenceImages = await getSentenceImagesByTopicId(
    parseInt(topicId, 10)
  );
  const topic = await getTopicById(parseInt(topicId, 10));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SentenceViewer sentenceImages={sentenceImages} topicTitle={topic.title} onRecordReview={reviewContent} />
    </Suspense>
  );
}
