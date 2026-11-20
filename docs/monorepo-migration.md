# Monorepo migration (2026-11-20)

`atuandev/4kidstudy-frontend` (renamed to `atuandev/4kidstudy`) and `atuandev/4kidstudy-backend` were combined into one pnpm + Turborepo repository.

**Goal:** the backend's API contract is the single source of truth for the frontend, so contract drift shows up as a compile error, not a runtime bug.

## How history was preserved

- **Frontend:** the existing commits are kept unchanged (same SHAs). One commit moves everything into `apps/web`. The new `master` descends from the old one, so pushing it is a fast-forward: no force push, and existing PR links keep working.
- **Backend:** all 132 commits were rewritten under `apps/api/` with `git filter-branch`, then merged with `--allow-unrelated-histories`. PR references like `#27` were rewritten to `atuandev/4kidstudy-backend#27` so they keep pointing at the right repository.
- **Branches:**
  - Backend `dev2` (1 unmerged commit) is imported as `api-dev2` and merges cleanly.
  - Backend `dev` was fully merged and is not imported.
  - Frontend `dev` and `dev2` stay on GitHub. `dev2` has 23 unmerged commits and is 4 behind master. Merging it into the monorepo conflicts in `package.json`, `pnpm-lock.yaml` and `next.config.ts`, and git asks to relocate one added file (`public/excel-template-example.png` → `apps/web/public/…`).
- **Secrets:** gitleaks over every ref of both repos, before and after merging, found one hit. It's a false positive (the NestJS README badge `token=abc123def456`) and is listed in `.gitleaksignore`. `.env` files were never committed, and every `.env.example` value ever committed is a placeholder.

## Evidence

The baseline was taken from the two original repos before any change.

| Check | Before | After |
| --- | --- | --- |
| Web `next build` | ✅ 29 routes | ✅ the same 29 routes and the same static/dynamic split. First Load JS is within 1 kB on every route; shared chunks are 167 kB in both |
| Web `tsc --noEmit` | ✅ | ✅ |
| API `nest build` | ✅ | ✅ |
| API unit tests | ❌ 9 failed, 3 passed | ✅ 12 passed (stale specs fixed in their own commit) |
| API e2e | ❌ the spec file has no tests | unchanged. It isn't part of `test`; see follow-ups |
| Resolved `compilerOptions` (`tsc --showConfig`) | — | identical for both apps |
| Lint findings (file:line:rule) | web 111 (35 errors), api 237 (108 errors) | web: identical. API: identical apart from line shifts in `main.ts` |
| Direct dependency versions | — | all identical, except web `@types/node` 20 → 22 (intentional, matches the API runtime) |
| Fresh clone in clean `node:22` Linux container: `pnpm install --frozen-lockfile`, contract drift check, `turbo run typecheck build test` | — | ✅ all pass. Contracts generated on Linux are byte-identical to the committed ones |
| `git log --follow` on moved files | — | reaches the original first commit (e.g. `apps/web/lib/http.ts` → 2025-09-05) |
| Commit counts | 287 frontend + 132 backend | 287 + 132 preserved |
| Contract drift: rename `LessonStatus.ARCHIVED` → `HIDDEN` in the schema and the API code | — | the CI drift check fails, and after regenerating, web typecheck fails at `dashboard-overview.tsx` and `schemas/lesson.ts` |
| Contract drift: rename column `Topic.coverImage` | — | web typecheck fails in `types/contracts-compat.ts`, naming the field |
| Turbo cache | — | second run: 6 of 7 tasks cached, 0.56 s (`db:generate` is never cached) |
| `--affected` | — | an API-only change skips the web build; a contracts change rebuilds web, not the API |
| API Docker image | none existed | builds, runs `prisma migrate deploy` on a fresh Postgres, boots, and serves `/api/docs` and `/api/topics` (200), returns 401 on guarded routes and 400 on bad input |

## Cutover plan

### 1. Freeze

Announce a short freeze. Merge or close open PRs on both old repos. Decide what happens to frontend `dev2` (merge it into the old master first, or port it later).

### 2. Push

`git push origin master api-dev2` to `atuandev/4kidstudy`. This is a fast-forward of `master`.

### 3. Vercel (project currently named `4kidstudy-frontend`)

- Settings → Build and Deployment → **Root Directory: `apps/web`**. Leave "Include files outside the root directory" on.
- Environment variable **`ENABLE_EXPERIMENTAL_COREPACK=1`**. The lockfile is written by pnpm 12, and without Corepack Vercel uses pnpm 9/10 for it.
- Check that the Git connection follows the renamed repo (GitHub redirects, but confirm under Settings → Git).
- The Ignored Build Step comes from `apps/web/vercel.json` (`npx turbo-ignore --fallback=HEAD^1`). A value set in the dashboard overrides it.
- Deploy a preview from a branch first and confirm the build log shows pnpm 12.21.0 and `@4kidstudy/web`.

### 4. API host

Point it at the monorepo:

- **Docker:** `apps/api/Dockerfile`, build context = repo root.
- **Buildpack/Node host:** root directory = repo root, install with `pnpm install --frozen-lockfile`, build with `pnpm turbo run build --filter=@4kidstudy/api`, start with `node apps/api/dist/main`.

### 5. GitHub

- Enable the `CI` workflow as a required check on `master`.
- `atuandev/4kidstudy-backend` was archived on 2026-11-20. Don't delete it: rewritten commit messages link to its PRs.

### 6. Local machines

Clone `atuandev/4kidstudy` fresh. Copy `.env` files into `apps/web/.env` and `apps/api/.env`.

## Rollback

Both original repos and their GitHub history are unchanged until step 5.

- **Vercel:** set Root Directory back to empty and redeploy the last pre-migration deployment (Deployments → ⋯ → Promote to Production).
- **API host:** point it back at `atuandev/4kidstudy-backend`.
- **Repo:** `master` only moved forward, so `git push --force-with-lease origin a228077:master` restores the old frontend tip if needed. Prefer reverting forward.

## Known issues flagged (not changed)

1. **Lint errors existed in both apps before the migration:** web 35, API 108 (94 of them auto-fixable formatting). CI runs lint as non-blocking until they're fixed.
2. **`apps/api/docker-compose.yml`** hardcodes the local Postgres password `123456`. Fine for local dev; don't reuse it anywhere else.
3. **Stray scripts in `apps/api`:** `check-api-direct.js`, `check-key.js` and `test-models.js` are ad-hoc Gemini key checkers that print the first 10 characters of `GEMINI_API_KEY`. Move them to `apps/api/scripts/` or delete them.
4. **`xlsx@0.18.5`** (both apps) is the last npm release of SheetJS and has public advisories (prototype pollution, ReDoS). Maintained builds ship from the SheetJS CDN.
5. **CORS origins** in `apps/api/src/main.ts` are hardcoded to `4kidstudy-frontend*.vercel.app`. They keep working because the Vercel project name didn't change; update them if it does.
6. **Model types:** the UI's hand-written types use `field?: T` where the API returns `T | null`. The compat check only verifies field names. Moving the UI types onto `@4kidstudy/contracts` model types is the next step, file by file.
7. **`apps/api/test/app.e2e-spec.ts`** has no tests.
8. **API image size:** 702 MB, of which about 230 MB is Prisma (client, engines and the CLI used for `migrate deploy`). A separate migration image, or Prisma's newer engine options, would shrink it.
9. **Vercel's security bot** previously updated `package-lock.json`, not `pnpm-lock.yaml`. Check an old build log to see which package manager production actually used. Once on the monorepo it's pnpm only.
