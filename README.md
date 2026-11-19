# 4KidStudy

English-learning platform for primary-school children (grades 1–5).

| Path | Package | What it is |
| --- | --- | --- |
| `apps/web` | `@4kidstudy/web` | Next.js 15 app (learners + admin), deployed on Vercel |
| `apps/api` | `@4kidstudy/api` | NestJS 11 + Prisma 6 + PostgreSQL API |
| `packages/contracts` | `@4kidstudy/contracts` | API contract generated from the Prisma schema and OpenAPI document |
| `packages/tsconfig` | `@4kidstudy/tsconfig` | Shared TypeScript bases |
| `packages/eslint-config` | `@4kidstudy/eslint-config` | Shared ESLint configs (`base`, `nest`, `next`) |

## Requirements

- Node 22 (`.nvmrc`)
- pnpm 12.21.0. Pinned in `package.json` → `packageManager`; `corepack enable` picks it up.
- Docker, for the local Postgres

## Getting started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # fill in real values
cp apps/web/.env.example apps/web/.env   # NEXT_PUBLIC_API_ENDPOINT + Cloudinary
docker compose -f apps/api/docker-compose.yml up -d
pnpm --filter @4kidstudy/api prisma:migrate:deploy
pnpm dev                                  # web on :3000, api on :3001
```

## Common tasks

| Command | Does |
| --- | --- |
| `pnpm dev` | Run both apps in watch mode |
| `pnpm build` / `pnpm typecheck` / `pnpm test` / `pnpm lint` | Run across the repo (Turborepo, cached) |
| `pnpm --filter @4kidstudy/web <script>` | Run one app's script |
| `pnpm contracts:generate` | Regenerate `packages/contracts` after changing `schema.prisma` or any DTO |

## The API contract

`packages/contracts` is generated, never hand-edited:

- **Enums and model types** come from `apps/api/prisma/schema.prisma` (via the Prisma DMMF).
- **Request/response DTO types** come from the API's OpenAPI document (`apps/api/src/openapi.ts`, which builds it without a database connection), converted with `openapi-typescript`.

The output is committed, so `apps/web` builds without building the API. CI regenerates it and fails if the result differs from what's committed.

The web app imports enums from it (`import { GradeLevel } from "@4kidstudy/contracts"`). `apps/web/types/contracts-compat.ts` checks at compile time that the UI's types only use fields that exist on the backend models.

When you change the schema or a DTO:

```bash
pnpm contracts:generate
pnpm typecheck        # shows every place in the web app that needs updating
```

## Deploying

- **Web:** Vercel project with Root Directory `apps/web`. `apps/web/vercel.json` skips deploys a commit doesn't affect.
- **API:** `apps/api/Dockerfile`, built from the repo root:

  ```bash
  docker build -f apps/api/Dockerfile -t 4kidstudy-api .
  docker run --rm --env-file apps/api/.env 4kidstudy-api node_modules/.bin/prisma migrate deploy
  docker run --env-file apps/api/.env -p 3001:3001 4kidstudy-api
  ```

## History

This repository was `atuandev/4kidstudy-frontend`. The backend's full history from `atuandev/4kidstudy-backend` was merged in under `apps/api`. Use `git log --follow <path>` to trace files across the move. Backend PR references in old commit messages were rewritten to `atuandev/4kidstudy-backend#N`. See [`docs/monorepo-migration.md`](docs/monorepo-migration.md).
