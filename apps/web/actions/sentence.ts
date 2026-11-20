"use server";

import http from "@/lib/http";
import { Sentence, SentenceImage } from "@/types";
import { CreateSentenceImageFormData } from "@/schemas/sentence";
import { revalidatePath } from "next/cache";
import { expireTopicsCache } from "@/lib/data/topic-cache";

export async function getSentenceImages() {
  const { payload } = await http.get<SentenceImage[]>("/sentences/images");
  return payload;
}

/** A topic's sentence images; pass `activeOnly` for the learner view (hidden images and sentences left out). */
export async function getSentenceImagesByTopicId(topicId: number, activeOnly = false) {
  const query = activeOnly ? "?isActive=true" : "";
  const { payload } = await http.get<SentenceImage[]>(`/sentences/images/topic/${topicId}${query}`);
  return payload;
}

export async function deleteSentence(id: number) {
  const { payload } = await http.delete<Sentence>(`/sentences/${id}`);
  revalidatePath("/admin/sentences");
  expireTopicsCache();
  return payload;
}

export async function getSentenceImage(id: number) {
  const { payload } = await http.get<SentenceImage>(`/sentences/images/${id}`);
  return payload;
}

export async function deleteSentenceImage(id: number) {
  const { payload } = await http.delete<SentenceImage>(`/sentences/images/${id}`);
  revalidatePath("/admin/sentences");
  expireTopicsCache();
  return payload;
}

function cleanSentenceImageData(data: CreateSentenceImageFormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleaned: any = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) cleaned[key] = value;
  });
  if (Array.isArray(cleaned.sentences)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cleaned.sentences = cleaned.sentences.map((s: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    "/sentences/images/with-sentences",
    JSON.stringify(body),
  );
  revalidatePath("/admin/sentences");
  expireTopicsCache();
  return payload;
}

export async function bulkCreateSentences(
  topicId: number,
  sentenceImages: Omit<CreateSentenceImageFormData, "topicId">[],
) {
  const cleanedSentenceImages = sentenceImages.map((img) =>
    cleanSentenceImageData({ ...img, topicId } as CreateSentenceImageFormData),
  );
  const { payload } = await http.post<SentenceImage[]>(
    "/sentences/bulk",
    JSON.stringify({ topicId, sentenceImages: cleanedSentenceImages }),
  );
  revalidatePath("/admin/sentences");
  expireTopicsCache();
  return payload;
}

export async function updateSentenceImage(id: number, data: Partial<CreateSentenceImageFormData>) {
  const body = cleanSentenceImageData(data as CreateSentenceImageFormData);
  const { payload } = await http.put<SentenceImage>(
    `/sentences/images/${id}`,
    JSON.stringify(body),
  );
  revalidatePath("/admin/sentences");
  expireTopicsCache();
  return payload;
}

export async function updateSentence(id: number, data: Partial<Sentence>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== "id" && key !== "sentenceImageId") {
      body[key] = value;
    }
  });
  const { payload } = await http.put<Sentence>(`/sentences/${id}`, JSON.stringify(body));
  revalidatePath("/admin/sentences");
  expireTopicsCache();
  return payload;
}
