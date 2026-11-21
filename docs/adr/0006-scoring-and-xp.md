# 0006. Scoring: 10 / 5 points per try, XP equals score

- Status: Accepted
- Date: 2026-11-21

## Decision

- Each exercise allows two tries. Right on the first try is 10 points, right
  on the second is 5 (`pointsForTry`). Two wrong tries count as wrong, and
  the lesson moves on. A retry is timed from the moment it starts. `attempts`
  on an answer is 1 or 2.
- Pronunciation: an overall score of 80 or more earns 10 points, more than
  50 earns 5, and anything lower is wrong.
- A skipped exercise (for example, no microphone) is counted but earns 0.
- The client scores, but the server never trusts it: `submitAttempt` awards
  at most the exercise's `points`, and 0 for a wrong answer, whatever the
  client sent.
- XP for an attempt equals its total score (1:1). It was chosen as the
  simplest rule, and a different ratio needs a new ADR.
