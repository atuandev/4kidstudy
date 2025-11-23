import { Flashcard } from "@/types";
import { FlashcardViewer } from "./flashcard-viewer";
import { ErrorDisplay } from "./error-display";
import { reviewContent, getReviewedFlashcardIds } from '@/actions/learning-progress';

export async function FlashcardsContent({ data }: { data: Flashcard[] }) {
  if (!data || !Array.isArray(data)) {
    return <ErrorDisplay message="Invalid topic ID" />;
  }

  if (!data || !Array.isArray(data)) {
    return <ErrorDisplay message="No flashcards found for this topic" />;
  }

  // Sort flashcards by order
  const sortedFlashcards = data.sort(
    (a: Flashcard, b: Flashcard) => a.order - b.order
  );

  // Get reviewed flashcard IDs from backend
  const topicId = sortedFlashcards[0]?.topicId;
  let reviewedFlashcardIds: number[] = [];
  
  if (topicId) {
    try {
      reviewedFlashcardIds = await getReviewedFlashcardIds(topicId);
    } catch (error) {
      console.error('Failed to fetch reviewed flashcards:', error);
      // Continue without reviewed IDs - user will need to complete assessment
    }
  }

  return (
    <FlashcardViewer 
      flashcards={sortedFlashcards} 
      onRecordReview={reviewContent}
      initialReviewedIds={reviewedFlashcardIds}
    />
  );
}
