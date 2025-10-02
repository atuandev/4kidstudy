"use server";

import http from "@/lib/http";
import { SentenceImage } from "@/types";

export const getSentenceImagesByTopicId = async (topicId: number) => {
  const { payload } = await http.get<SentenceImage[]>(
    `/sentences/images/topic/${topicId}`
  );
  return payload;
};
