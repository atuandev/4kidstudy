# 0005. A lesson is saved once, when it is finished

- Status: Accepted
- Date: 2026-11-21

## Context

Attempts used to be written answer by answer (`POST /attempts`, then
`/attempts/:id/submit` for each exercise). An abandoned lesson left an
unfinished attempt with partial rows behind. Children also leave lessons
halfway and come back later.

## Decision

**One request at the end.** Nothing reaches the backend while the learner
plays. The quiz store keeps one final result per exercise, in the order
answered (`recordAnswer`). The finish page sends them all in
`POST /attempts/submit`, and `AttemptService.submitAttempt` writes the
completed attempt, every answer (with pronunciation scores), the XP and the
streak in one transaction. The transaction timeout is 15 s, because each
answer is its own insert. Answers saved together share a timestamp, so they
are read back ordered by `createdAt`, then `id`.

**Saving on the finish page** (`useSaveAttempt`). The save runs once, when
the finish page mounts, in the background. Only a failure is shown, with a
retry that sends the same answers again. A ref keeps an attempt from being
sent twice, and it also absorbs React Strict Mode's second effect run. A
lesson with no answers saves nothing.

**Unfinished lessons resume** (`lib/lesson-progress.ts`, `useQuizSession`):

- Progress is saved in `localStorage` after every answer, when the tab is
  hidden, and on leaving. It is stored per user and lesson, so children
  sharing a device keep their own progress.
- A save is dropped when the lesson's exercise ids change (added, removed or
  reordered) or when it is older than 14 days.
- When saved progress exists, nothing is saved until the learner picks
  resume or restart. A fresh start never overwrites the old save before the
  learner chooses.
- `isReady` stays false until the stores have been reset for this lesson, so
  a store left over from an earlier lesson is never shown or saved.
- A settled exercise (right, or wrong twice) resumes at the next one. One
  left after a single wrong try resumes on its second try.
- Elapsed time is saved, and time away is not counted. Time spent on the
  resume dialog doesn't count either.
- Once every exercise is answered, the finish page owns the save. Progress
  is written once on reaching it, so a failed submit can resume and retry,
  and then left alone, so it can't come back after a successful submit
  clears it.
- If storage is full or blocked (private mode), the lesson still works. It
  just can't resume.

**Leaving.** Lessons run full screen without the app sidebar. The only way
out is the header's exit button, which asks before throwing the attempt
away. The resume dialog stays open until a choice is made.

## Consequences

- An abandoned lesson leaves no rows, and practice statistics only count
  finished attempts (ADR 0007).
- Progress doesn't follow the learner to another device.
- The old per-answer endpoints still exist for compatibility.
