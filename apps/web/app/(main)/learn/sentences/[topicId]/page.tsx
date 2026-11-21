import { Suspense } from "react";
import { getSentenceImagesByTopicId } from "@/actions/sentence";
import { SentenceViewer } from "./_components/sentence-viewer";
import { getTopicById } from "@/actions/topic";
import { reviewContent, getMasteredSentenceIds } from "@/actions/learning-progress";

interface SentencesTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function SentencesTopicPage({ params }: SentencesTopicPageProps) {
  const { topicId } = await params;
  const topicIdNum = parseInt(topicId, 10);

  const sentenceImages = await getSentenceImagesByTopicId(topicIdNum, true);
  const topic = await getTopicById(topicIdNum);

  let masteredSentenceIds: number[] = [];
  try {
    masteredSentenceIds = await getMasteredSentenceIds(topicIdNum);
  } catch (error) {
    console.error("Failed to fetch mastered sentences:", error);
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SentenceViewer
        sentenceImages={sentenceImages}
        topicTitle={topic.title}
        topicGrade={topic.grade ?? "GRADE_1"}
        topicId={topicIdNum}
        onRecordReview={reviewContent}
        initialMasteredIds={masteredSentenceIds}
      />
    </Suspense>
  );
}
