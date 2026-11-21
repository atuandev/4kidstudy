# Architecture Decision Records

Decisions that the code alone can't explain live here, not in code comments
([ADR 0001](0001-no-code-comments.md)). Each record says what was decided and
why, so a later change can tell whether the reason still holds.

Add one with the next free number. Records are not edited after the fact: to
reverse a decision, write a new record that supersedes the old one and set the
old one's status to `Superseded by NNNN`.

| ADR | Decision |
| --- | --- |
| [0001](0001-no-code-comments.md) | No code comments; decisions go in ADRs |
| [0002](0002-cors-exact-origins.md) | CORS allows exact origins only |
| [0003](0003-api-auth-tokens.md) | API auth: JWT user cache and password-reset tokens |
| [0004](0004-web-session.md) | Web session lives in httpOnly cookies |
| [0005](0005-lesson-attempts-saved-once.md) | A lesson is saved once, when it is finished |
| [0006](0006-scoring-and-xp.md) | Scoring: 10 / 5 points per try, XP equals score |
| [0007](0007-practice-statistics.md) | What practice statistics count |
| [0008](0008-vietnam-practice-day.md) | A practice day follows Vietnam time |
| [0009](0009-weekly-leaderboard.md) | Weekly leaderboard and class average |
| [0010](0010-flashcard-and-sentence-progress.md) | Flashcard and sentence progress |
| [0011](0011-content-ordering-and-deletion.md) | Content ordering, partial updates and deletion |
| [0012](0012-excel-import-export.md) | Excel import and export |
| [0013](0013-pronunciation-assessment.md) | Pronunciation assessment |
| [0014](0014-topic-list-caching.md) | Topic list caching and parallel fetches |
| [0015](0015-api-contracts-package.md) | `@4kidstudy/contracts` is generated from the API |
| [0016](0016-lesson-player-interaction.md) | Lesson player interaction rules |
| [0017](0017-grade-scoped-routes.md) | Grade-scoped routes |
| [0018](0018-single-icon-module.md) | One icon module |
