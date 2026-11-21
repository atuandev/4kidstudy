import { updateTag } from "next/cache";

export const TOPICS_CACHE_TAG = "topics";

export const TOPICS_REVALIDATE_SECONDS = 300;

export function expireTopicsCache() {
  updateTag(TOPICS_CACHE_TAG);
}
