# 0014. Topic list caching and parallel fetches

- Status: Accepted
- Date: 2026-11-21

## Decision

**The topic list is cached.** The learner-facing topic list (topics with
their lessons, flashcards and counts) is the same for every user and only
changes when an admin edits content. It is kept in the Next data cache under
the `topics` tag (`lib/data/topic-cache.ts`):

- It is fetched without the user's token, which would otherwise become part
  of the cache key.
- Admin server actions expire it with `expireTopicsCache`. The admin import
  route expires it too, using `revalidateTag`, because route handlers can't
  use `updateTag`.
- It expires on its own after 300 s, for content changed outside the admin
  UI (for example, straight through the API).

**Independent requests run together:**

- Topics and the user's progress are fetched in parallel: two round-trips,
  not one per topic.
- The practice page fetches stats and topics together.
- The units page starts the stats request without waiting for it, so the
  progress strip streams in after the grid.
