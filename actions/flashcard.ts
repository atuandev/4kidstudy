'use server';

import http from '@/lib/http';
import { Flashcard } from '@/types';

export async function getFlashcards() {
  const { payload } = await http.get<Flashcard[]>('/flashcards');
  return payload;
}

export async function getFlashcardsByTopic(topicId: number) {
  const response = await http.get<Flashcard[]>(`/flashcards/topic/${topicId}`);
  return response;
}

export async function deleteFlashcard(id: number) {
  const { payload } = await http.delete<Flashcard>(`/flashcards/${id}`);
  return payload;
}