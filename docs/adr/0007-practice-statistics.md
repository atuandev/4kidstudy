# 0007. What practice statistics count

- Status: Accepted
- Date: 2026-11-21

## Decision

`GET /attempts/statistics` and `GET /attempts/statistics/daily` count:

- **Finished attempts only.** Unfinished ones come from the old
  answer-by-answer flow (ADR 0005) and were abandoned.
- **Lessons learners can see:** `PUBLISHED` or `ARCHIVED`, as the topics
  list shows them.
- **One grade,** when given, so the numbers match the practice page they
  sit on.
- **Right and wrong from the saved answers,** not from the attempt's own
  counters. Deleting an exercise deletes its answers but not the counters,
  and counting answers keeps the per-topic totals equal to the per-type
  ones. The overall totals are the sums of the per-topic rows.

The queries run together. Postgres returns `COUNT`/`SUM` as `bigint`, so
they are cast to `int`.

Field meanings, shared by the API DTOs and `apps/web/types/attempt.ts`:

| Field | Meaning |
| --- | --- |
| `incorrectCount`, `totalIncorrectCount` | Answers that were not right, skipped ones included |
| `totalCorrectOnSecondCount` | Right answers that needed a second try |
| `perfectLessonCount` | Lessons with at least one full-score attempt |
| `attemptCount` | Finished attempts, retries included |
| `accuracyPct` | Right answers out of all answers, 0–100 |
| `scorePct` | Points earned out of points possible, 0–100 |
| `recentAttempts` | The 5 most recently finished lessons, newest first |
| `byType` | Every exercise type in the app's order, zeros for unpractised types |
| daily `data` | Every day in the range, oldest first, zeros on days without practice |

The accuracy chart leaves a gap on days without answers instead of drawing
a fake 0%.
