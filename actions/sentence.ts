'use server';

import http from '@/lib/http';
import { Sentence, SentenceImage } from '@/types';

export async function getSentences() {
  const { payload } = await http.get<Sentence[]>('/sentences');
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
  return payload;
}
