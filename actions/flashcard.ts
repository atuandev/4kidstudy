'use server';

import http from '@/lib/http';
import { Flashcard } from '@/types';

export const getFlashcardsByTopic = async (topicId: number) => {
  const response = await http.get<Flashcard[]>(`/flashcards/topic/${topicId}`);
  return response;
};