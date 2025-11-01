import { Flashcard } from "@/types";
import { FlashcardViewer } from "./flashcard-viewer";
import { ErrorDisplay } from "./error-display";
import { reviewContent } from '@/actions/learning-progress';

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

  return <FlashcardViewer flashcards={sortedFlashcards} onRecordReview={reviewContent} />;
}
