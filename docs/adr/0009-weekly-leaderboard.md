# 0009. Weekly leaderboard and class average

- Status: Accepted
- Date: 2026-11-21

## Decision

**Ranking** (`GET /leaderboard/weekly`):

- The pool is the active learners in the user's grade. The week runs from
  Monday 00:00 to the next Monday, in the server's time zone (see ADR 0008).
- Only learners with points this week are ranked, highest score first, then
  by name so equal scores keep a steady order. The rest are counted in
  `unrankedCount`, the user included.
- Equal scores share a rank, and the next rank skips: 100, 80, 80, 50 rank
  1, 2, 2, 4.
- `currentUserRank` is 0 when the user has no points this week. The page
  says so instead of ranking the learner last.
- Users and their weekly sums come in one round-trip, not one query per user.

**Leaderboard page.** The learner's own row is found by user id, not by
rank, because ranks repeat. When the learner is below the top 10, their row
stays visible after a row of dots.

**Class average** (streak and topic XP stats). `gradeData` and
`gradeXpEarned` sum XP over every active learner in the user's grade.
`gradeLearnerCount` counts those learners, the user included, and learners
without XP count too. The average per learner is rounded. The chart draws
the class line whenever the grade has learners. With only the learner in
it, the line sits on their own bars and the pill says nobody else is there
to compare with.
