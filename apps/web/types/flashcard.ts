export interface Flashcard {
  id: number;
  topicId: number;
  term: string;
  phonetic: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  imageUrl: string;
  audioUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  topic: {
    id: number;
    title: string;
    grade: string;
  };
}
