import { Suspense } from "react";
import { getSentenceImagesByTopicId } from "@/actions/sentence";
import { SentenceViewer } from "./_components/sentence-viewer";
import { getTopicById } from "@/actions/topic";
import { reviewContent, getMasteredSentenceIds } from '@/actions/learning-progress';

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
  
  // Get mastered sentence IDs from backend (sentences with isMastered = true)
  let masteredSentenceIds: number[] = [];
  try {
    masteredSentenceIds = await getMasteredSentenceIds(topicIdNum);
  } catch (error) {
    console.error('Failed to fetch mastered sentences:', error);
    // Continue without mastered IDs - user will need to complete assessment
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SentenceViewer 
        sentenceImages={sentenceImages} 
        topicTitle={topic.title}
        topicGrade={topic.grade}
        topicId={topicIdNum}
        onRecordReview={reviewContent}
        initialMasteredIds={masteredSentenceIds}
      />
    </Suspense>
  );
}
