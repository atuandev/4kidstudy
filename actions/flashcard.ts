'use server';

import http from '@/lib/http';
import { Flashcard } from '@/types';
import { revalidatePath } from 'next/cache';
import { CreateFlashcardFormData } from '@/schemas/flashcard';

export async function getFlashcards() {
  const { payload } = await http.get<Flashcard[]>('/flashcards');
  return payload;
}

export async function getFlashcard(id: number) {
  const { payload } = await http.get<Flashcard>(`/flashcards/${id}`);
  return payload;
}

export async function getFlashcardsByTopic(topicId: number) {
  const response = await http.get<Flashcard[]>(`/flashcards/topic/${topicId}?isActive=true`);
  return response;
}

// Admin version - fetches ALL flashcards including inactive
export async function getFlashcardsByTopicForAdmin(topicId: number) {
  const response = await http.get<Flashcard[]>(`/flashcards/topic/${topicId}`);
  return response;
}

export async function createFlashcard(data: CreateFlashcardFormData) {
  const { payload } = await http.post<Flashcard>(
    '/flashcards',
    JSON.stringify(data)
  );
  revalidatePath('/admin/flashcards');
  return payload;
}

export async function bulkCreateFlashcards(topicId: number, flashcards: Omit<CreateFlashcardFormData, 'topicId'>[]) {
  const { payload } = await http.post<Flashcard[]>(
    '/flashcards/bulk',
    JSON.stringify({ topicId, flashcards })
  );
  revalidatePath('/admin/flashcards');
  return payload;
}

export async function updateFlashcard(
  id: number,
  data: CreateFlashcardFormData
) {
  const { payload } = await http.put<Flashcard>(
    `/flashcards/${id}`,
    JSON.stringify(data)
  );
  revalidatePath('/admin/flashcards');
  return payload;
}

export async function deleteFlashcard(id: number) {
  const { payload } = await http.delete<{ flashcard: Flashcard; hasProgress: boolean; deleted: boolean }>(`/flashcards/${id}`);
  revalidatePath('/admin/flashcards');
  return payload;
}