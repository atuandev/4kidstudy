export interface LearningProgress {
  id: number;
  userId: number;
  reviewCount: number;
  isMastered: boolean;
  lastReviewedAt?: string;
  contentType: 'FLASHCARD' | 'SENTENCE';
  flashcardId?: number;
  sentenceId?: number;
  createdAt: string;
  updatedAt: string;
  flashcard?: {
    id: number;
    term: string;
    meaningVi: string;
    imageUrl?: string;
    audioUrl?: string;
  };
  sentence?: {
    id: number;
    text: string;
    meaningVi?: string;
    audioUrl?: string;
  };
}

export interface LearningProgressStats {
  totalReviewed: number;
  totalMastered: number;
  masteryRate: number;
  flashcardStats: {
    total: number;
    mastered: number;
    inProgress: number;
  };
  sentenceStats: {
    total: number;
    mastered: number;
    inProgress: number;
  };
}

export interface TopicProgress {
  topicId: number;
  totalFlashcards: number;
  reviewedFlashcards: number;
  flashcardProgress: number;
  totalSentences: number;
  reviewedSentences: number;
  sentenceProgress: number;
  lastReviewedFlashcardIndex?: number;
  lastReviewedSentenceIndex?: number;
}
