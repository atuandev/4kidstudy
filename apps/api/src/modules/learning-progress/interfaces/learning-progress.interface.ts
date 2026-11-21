import { LearningProgress, Flashcard, Sentence } from '@prisma/client';

export interface LearningProgressWithFlashcard extends LearningProgress {
  flashcard?: Flashcard | null;
}

export interface LearningProgressWithSentence extends LearningProgress {
  sentence?: Sentence | null;
}

export interface LearningProgressWithRelations extends LearningProgress {
  flashcard?: Flashcard | null;
  sentence?: Sentence | null;
}

export interface LearningProgressWithSelectedRelations extends LearningProgress {
  flashcard?: {
    id: number;
    term: string;
    meaningVi: string;
    imageUrl?: string | null;
    audioUrl?: string | null;
    topicId: number;
    topic: {
      id: number;
      grade: string;
    };
  } | null;
  sentence?: {
    id: number;
    text: string;
    meaningVi?: string | null;
    audioUrl?: string | null;
    sentenceImageId: number;
    sentenceImage: {
      id: number;
      topicId: number;
      topic: {
        id: number;
        grade: string;
      };
    };
  } | null;
}
