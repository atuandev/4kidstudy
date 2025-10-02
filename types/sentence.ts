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
}
