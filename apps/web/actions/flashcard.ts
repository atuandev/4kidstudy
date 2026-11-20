'use server';

import http from '@/lib/http';
import { Flashcard } from '@/types';
import { revalidatePath } from 'next/cache';
import { CreateFlashcardFormData, NewFlashcardInput } from '@/schemas/flashcard';

export async function getFlashcards() {
  const { payload } = await http.get<Flashcard[]>('/flashcards');
  return payload;
}

export async function getFlashcard(id: number) {
  const { payload } = await http.get<Flashcard>(`/flashcards/${id}`);
  return payload;
}

export async function getFlashcardsByTopic(topicId: number) {
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

export async function bulkCreateFlashcards(topicId: number, flashcards: NewFlashcardInput[]) {
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
  const { payload } = await http.delete<Flashcard>(`/flashcards/${id}`);
  revalidatePath('/admin/flashcards');
  return payload;
}