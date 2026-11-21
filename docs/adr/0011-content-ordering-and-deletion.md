# 0011. Content ordering, partial updates and deletion

- Status: Accepted
- Date: 2026-11-21

## Decision

- **The backend assigns order.** A topic, lesson, flashcard, sentence image,
  exercise or option created without `order` goes after the current highest
  in its parent. The admin forms never send `order` for new items. Bulk
  creates only number the items that have no order.
- **Exercise options are a partial update.** `PATCH /exercises/:id` touches
  options only when the request includes them, so an exercise's own fields
  can change without resending its options.
- **Deleting keeps learning data:**
  - A flashcard with learning progress is soft-deleted (`isActive = false`).
    One without progress is deleted outright.
  - Sentence images and sentences are always soft-deleted.
  - Deleting an exercise cascades to its options through the Prisma schema
    (`onDelete: Cascade`).
- **Reset progress.** Updating a flashcard or sentence with `resetProgress`
  deletes its learning progress.
