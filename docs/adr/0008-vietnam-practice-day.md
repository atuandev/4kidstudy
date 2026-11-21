# 0008. A practice day follows Vietnam time

- Status: Accepted
- Date: 2026-11-21

## Decision

Learners are in Vietnam, so a practice "day" follows their clock:
`Asia/Ho_Chi_Minh`. The API buckets daily practice statistics in that zone
and sends days as `YYYY-MM-DD`. The web app reads those strings as plain
dates and formats dates (such as "20/11") in the same zone.

## Consequences

- Streak days are still stored and returned as UTC dates (`StreakLog.date`,
  midnight UTC), and the XP chart reads them in UTC. Between 00:00 and 07:00
  Vietnam time, practice lands on the previous streak day. The weekly
  leaderboard's Monday is in the server's time zone too. Tracked in an issue.
