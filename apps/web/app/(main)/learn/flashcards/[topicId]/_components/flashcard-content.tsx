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

  // Get mastered flashcard IDs from backend (isMastered = true, reviewCount >= 50)
  const topicId = sortedFlashcards[0]?.topicId;
  let masteredFlashcardIds: number[] = [];
  
  if (topicId) {
    try {
      masteredFlashcardIds = await getReviewedFlashcardIds(topicId);
    } catch (error) {
      console.error('Failed to fetch mastered flashcards:', error);
      // Continue without mastered IDs - user will need to complete reviews
    }
  }

  return (
    <FlashcardViewer 
      flashcards={sortedFlashcards} 
      onRecordReview={reviewContent}
      initialMasteredIds={masteredFlashcardIds}
    />
  );
}
