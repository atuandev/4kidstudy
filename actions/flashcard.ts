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

export async function checkFlashcardProgress(ids: number[]) {
    const { payload } = await http.post<Array<{
        id: number;
        term: string;
        progressCount: number;
        hasMastered: boolean;
    }>>(`/flashcards/check-progress`, JSON.stringify({ flashcardIds: ids }));
    return payload;
}

export async function checkFlashcardProgressForDelete(id: number) {
    const { payload } = await http.post<{
        id: number;
        term: string;
        hasProgress: boolean;
        progressCount: number;
        masteredCount: number;
    }>(`/flashcards/check-progress-for-delete/${id}`, JSON.stringify({}));
    return payload;
}

export async function updateFlashcard(
    id: number,
    data: CreateFlashcardFormData & { resetProgress?: boolean }
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

export async function exportFlashcards() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/flashcards/export`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flashcards-export.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}