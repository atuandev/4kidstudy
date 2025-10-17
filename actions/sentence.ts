'use server';

import http from '@/lib/http';
import { Sentence, SentenceImage } from '@/types';
import { CreateSentenceImageFormData } from '@/schemas/sentence';
import { revalidatePath } from 'next/cache';

export async function getSentenceImages() {
  const { payload } = await http.get<SentenceImage[]>('/sentences/images');
  return payload;
}

export async function getSentenceImagesByTopicId(topicId: number) {
  const { payload } = await http.get<SentenceImage[]>(
    `/sentences/images/topic/${topicId}`
  );
  return payload;
}

export async function deleteSentence(id: number) {
  const { payload } = await http.delete<Sentence>(`/sentences/${id}`);
  revalidatePath("/admin/sentences");
  return payload;
}

export async function getSentenceImage(id: number) {
  const { payload } = await http.get<SentenceImage>(`/sentences/images/${id}`);
  return payload;
}

function cleanSentenceImageData(data: CreateSentenceImageFormData) {
  const cleaned: any = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) cleaned[key] = value;
  });
  if (Array.isArray(cleaned.sentences)) {
    cleaned.sentences = cleaned.sentences.map((s: any) => {
      const cs: any = {};
      Object.entries(s).forEach(([k, v]) => {
        if (v !== undefined) cs[k] = v;
      });
      return cs;
    });
  }
  return cleaned;
}

export async function createSentenceImage(data: CreateSentenceImageFormData) {
  const body = cleanSentenceImageData(data);
  const { payload } = await http.post<SentenceImage>(
    '/sentences/images/with-sentences',
    JSON.stringify(body)
  );
  revalidatePath('/admin/sentences');
  return payload;
}

export async function updateSentenceImage(
  id: number,
  data: Partial<CreateSentenceImageFormData>
) {
  const body = cleanSentenceImageData(data as CreateSentenceImageFormData);
  const { payload } = await http.put<SentenceImage>(
    `/sentences/images/${id}`,
    JSON.stringify(body)
  );
  revalidatePath('/admin/sentences');
  return payload;
}
