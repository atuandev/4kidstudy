import { updateTag } from "next/cache";

/**
 * The learner-facing topic list (topics with their lessons, flashcards and
 * counts) is the same for every user and only changes when an admin edits
 * content, so it is kept in the Next data cache under this tag.
 */
export const TOPICS_CACHE_TAG = "topics";

/**
 * Fallback expiry, for content changed outside the admin UI (for example
 * straight through the API).
 */
export const TOPICS_REVALIDATE_SECONDS = 300;

/**
 * Expire the cached topic list after an admin content change.
 * Server Actions only: the admin's next render reads the new data.
 */
export function expireTopicsCache() {
  updateTag(TOPICS_CACHE_TAG);
}
