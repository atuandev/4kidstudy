import { Topic } from "./topic";
import { LearningProgress } from "./learning-progress";

export interface SentenceImage {
  id: number;
  topicId: number;
  imageUrl: string;
  audioUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sentences: Sentence[];
  topic: Topic;
}

export interface Sentence {
  id: number;
  sentenceImageId: number;
  text: string;
  meaningVi?: string;
  hintVi?: string;
  audioUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: LearningProgress[];
}
