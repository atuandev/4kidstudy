---
name: delete-comment
description: Audit code comments in this repo (or one path), classify each as tautology, stale, excuse or decision record, delete them, file issues for excuses, move decisions into docs/adr, and shrink the comment baseline. Use when asked to clean up comments, run the comment ratchet, or pay down tools/oxlint/comment-baseline.json.
argument-hint: "[path, e.g. apps/web/app/(admin)]"
---

# /delete-comment

The repo bans code comments (ADR 0001, `docs/adr/0001-no-code-comments.md`).
The oxlint rule `no-comments/no-comments` (`tools/oxlint/no-comments.mjs`)
fails any comment that isn't covered by `tools/oxlint/comment-baseline.json`,
and that baseline only goes down. This skill pays it down.

Scope: `$ARGUMENTS` if given (a file or directory), otherwise the whole repo.
Generated code (`**/src/generated/**`) and shadcn's `apps/web/components/ui/**`
are exempt in the rule itself. Leave them alone.

## 1. Inventory

```sh
node tools/oxlint/comments.mjs list --out "$SCRATCH/comments.json"
```

Each entry is `{ id, file, line, start, end, text }`. `start` and `end` are
string offsets into the file. Filter to the scope. Read every comment
together with the code around it: a comment can't be classified from its
text alone.

## 2. Classify every comment

| Category | Test | Action |
| --- | --- | --- |
| **Tautology** | Says what the next line already says (`// Create user`), restates a name or type, labels a JSX section (`{/* Header */}`), or repeats something `apps/web/DESIGN.md` or an existing ADR already records | Delete |
| **Stale** | Commented-out code, `console.log` leftovers, a claim the code contradicts (check it: thresholds, field names, "removed per request"), AI-chat residue, a lint directive that suppresses nothing | Delete |
| **Excuse** | Justifies a shortcut: `TODO`, "for now", "for demo", "simulate", `as any` with a reason, a swallowed error, an `eslint-disable`/`@ts-expect-error` that hides a real problem, comments that make up for a bad name or a magic value | Delete and file an issue |
| **Decision record** | Explains a non-obvious *why* someone would need before changing the code: a business rule, a constraint from a library or platform, a trade-off, a field's exact meaning | Move into an ADR, then delete |

Rules of thumb:

- When in doubt between tautology and decision record, ask whether a
  competent reader would make a wrong change without it. If not, it's a
  tautology.
- Verify stale claims against the code (`grep` the constant, read the
  condition). Don't trust the comment.
- Find unused directives with
  `cd apps/web && npx oxlint --report-unused-disable-directives` (for the API,
  add `--type-aware src test`). Unused ones are stale.
- A directive that still suppresses something is an excuse. **Don't delete
  it** (lint or typecheck would fail): file or extend an issue and leave it
  in the baseline. If a rule *option* in `.oxlintrc.json` expresses the
  exception properly (for example `no-namespace` `allowDeclarations`), change
  the config and delete the directive.

Keep the classification as data (a JSON of `id → category, issue or ADR`)
in the scratchpad, so the delete step is mechanical.

## 3. Excuses → issues

Group related excuses into one issue per underlying problem, not one per
comment. Before filing, search for an existing issue:
`gh issue list --state all --search "<keywords>"`. Add to an existing issue
rather than duplicating it. Each issue states:

- the problem and why it matters;
- a suggested fix;
- every location, as permalinks pinned to a pushed commit
  (`https://github.com/atuandev/4kidstudy/blob/<sha>/<path>#L<line>`), with
  the comment text, noting which comments were deleted and which directives
  remain;
- the closing step: "Then run `pnpm comments:baseline`."

Use labels `bug` (wrong behaviour), `enhancement` (cleanup) or
`good first issue`.

## 4. Decision records → ADRs

- Read `docs/adr/README.md`. Prefer extending the ADR that already covers
  the topic. Write a new one when the decision is new.
- New ADR: next free number, `docs/adr/NNNN-kebab-title.md`, with
  `Status`, `Date`, then `Context` (optional), `Decision`, `Consequences`.
  Add it to the README index.
- Write the decision in plain words, with concrete values (TTLs, thresholds,
  time zones). Check each value against the code before writing it.
- Accepted ADRs are not rewritten to reverse a decision. Write a superseding
  one instead. Adding detail to a current decision is fine.
- If the code contradicts the decision, say so under Consequences and file
  an issue.

## 5. Delete

```sh
node tools/oxlint/comments.mjs delete "$SCRATCH/plan.json"
```

`plan.json` holds the inventory entries to delete: everything except the
directives you are keeping. The script removes a line that holds only a
comment, the whitespace before a trailing comment, and the braces around a
JSX `{/* */}`. It refuses to touch a file that changed since `list`. Run it
on a clean tree so `git checkout -- <files>` can undo it.

## 6. Verify and lock in

```sh
pnpm format
pnpm typecheck && pnpm test
pnpm comments:baseline   # shrinks the counts; fails if any file grew
pnpm lint
pnpm contracts:generate && git diff --exit-code packages/contracts/src/generated packages/contracts/openapi.json
```

Inspect the added lines of the diff (`git diff -U0 | grep '^+'`) for
mangled code: an emptied block now reads `catch {}`, which is intended.
Report the counts per category, the issues filed, the ADRs added or
changed, and the baseline before and after.
