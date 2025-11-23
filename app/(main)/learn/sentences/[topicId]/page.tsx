import { Suspense } from "react";
import { getSentenceImagesByTopicId } from "@/actions/sentence";
import { SentenceViewer } from "./_components/sentence-viewer";
import { getTopicById } from "@/actions/topic";
import { reviewContent, getReviewedSentenceIds } from '@/actions/learning-progress';

interface SentencesTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function SentencesTopicPage({
  params,
}: SentencesTopicPageProps) {
  const { topicId } = await params;
  const topicIdNum = parseInt(topicId, 10);
  
  const sentenceImages = await getSentenceImagesByTopicId(topicIdNum);
  const topic = await getTopicById(topicIdNum);
  
  // Get reviewed sentence IDs from backend
  let reviewedSentenceIds: number[] = [];
  try {
    reviewedSentenceIds = await getReviewedSentenceIds(topicIdNum);
  } catch (error) {
    console.error('Failed to fetch reviewed sentences:', error);
    // Continue without reviewed IDs - user will need to complete assessment
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SentenceViewer 
        sentenceImages={sentenceImages} 
        topicTitle={topic.title}
        topicGrade={topic.grade}
        topicId={topicIdNum}
        onRecordReview={reviewContent}
        initialReviewedIds={reviewedSentenceIds}
      />
    </Suspense>
  );
}
