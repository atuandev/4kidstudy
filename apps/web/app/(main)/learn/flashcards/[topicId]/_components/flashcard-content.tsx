import { Flashcard } from "@/types";
import { FlashcardViewer } from "./flashcard-viewer";
import { ErrorDisplay } from "./error-display";
import { reviewContent, getReviewedFlashcardIds } from "@/actions/learning-progress";

export async function FlashcardsContent({ data }: { data: Flashcard[] }) {
  if (!data || !Array.isArray(data)) {
    return <ErrorDisplay message="Invalid topic ID" />;
  }

  if (!data || !Array.isArray(data)) {
    return <ErrorDisplay message="No flashcards found for this topic" />;
  }

  const sortedFlashcards = data.sort((a: Flashcard, b: Flashcard) => a.order - b.order);

  const topicId = sortedFlashcards[0]?.topicId;
  let masteredFlashcardIds: number[] = [];

  if (topicId) {
    try {
      masteredFlashcardIds = await getReviewedFlashcardIds(topicId);
    } catch (error) {
      console.error("Failed to fetch mastered flashcards:", error);
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
