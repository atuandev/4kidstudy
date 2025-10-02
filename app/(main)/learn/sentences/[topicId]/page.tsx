import { Suspense } from "react";
import { SentencesHeader } from "./_components/header";
import { getSentenceImagesByTopicId } from "@/actions/sentence";
import { SentenceViewer } from "./_components/sentence-viewer";

interface SentencesTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function SentencesTopicPage({
  params,
}: SentencesTopicPageProps) {
  const { topicId } = await params;
  const sentenceImages = await getSentenceImagesByTopicId(parseInt(topicId, 10));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SentencesHeader />
      <SentenceViewer sentenceImages={sentenceImages} />
    </Suspense>
  );
}
