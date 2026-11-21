# 0001. No code comments; decisions go in ADRs

- Status: Accepted
- Date: 2026-11-21

## Context

An audit of the first-party JS/TS source (`apps/api`, `apps/web`,
`packages/contracts`; generated contracts and shadcn's `components/ui` left
out) found 1,548 comments over 2,201 lines. Most just repeated the code. A
few were stale: commented-out code, thresholds that no longer matched, notes
left over from AI chat sessions. Some excused a shortcut that then got copied
elsewhere (`any` casts, a "limit for demo", fake progress bars). Only about
one in six recorded a decision someone would need later, and those were
scattered across files, often in two places at once (API DTO and web type).

## Decision

- Code carries no comments. Intent goes into names, types and tests.
- Decisions that the code can't show go into an ADR in `docs/adr/`.
- A shortcut gets a GitHub issue, not a comment that excuses it.
- The oxlint rule `no-comments/no-comments` (`tools/oxlint/no-comments.mjs`)
  enforces this in every package's `lint` task. A file with no entry in
  `tools/oxlint/comment-baseline.json` may have no comments.
- Existing comments are a ratchet. A file in the baseline may keep up to its
  count and never more. When a file drops below its count, lint fails until
  `pnpm comments:baseline` lowers it, so a deleted comment can't come back.
- `/delete-comment` (`.claude/skills/delete-comment/`) repeats the audit.

Lint and TypeScript directives (`eslint-disable`, `@ts-expect-error`) count
as comments. Most of them suppress a real problem, and each has an issue.

## Consequences

- No more drifting comments, and decisions are findable in one place.
- JSDoc hover text in editors is gone. Field meanings that used to sit in
  DTO comments are now in ADRs 0007 and 0009.
- The baseline has to be tightened when comments are deleted:
  `pnpm comments:baseline`.
- Non-JS comments (JSONC configs, CSS, Prisma schema, YAML) are not covered.
