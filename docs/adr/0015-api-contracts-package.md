# 0015. `@4kidstudy/contracts` is generated from the API

- Status: Accepted
- Date: 2026-11-21

## Context

See `docs/monorepo-migration.md`. The goal is that contract drift between
`apps/api` and `apps/web` fails the build, not production.

## Decision

- `packages/contracts/scripts/generate.mjs` writes `src/generated/prisma.ts`,
  `src/generated/openapi.ts` and `openapi.json`:
  - Prisma enums and model shapes come from the DMMF in the generated Prisma
    client. Scalars are typed as they arrive over JSON, so `DateTime` is an
    ISO-8601 string.
  - DTO schemas come from the OpenAPI document. `apps/api/src/openapi.ts`
    prints it without starting the server. `preview: true` builds the module
    graph without instantiating providers, so no database, mail or
    third-party connection opens. It needs `nest build` first, because the
    Swagger CLI plugin annotates DTOs at compile time. Turbo runs
    `@4kidstudy/api#build` before `generate`.
- `API_PREFIX` (`apps/api/src/swagger.ts`) is shared by `main.ts` and the
  generator.
- Run `pnpm contracts:generate` after changing the Prisma schema or any DTO.
  CI fails when the committed output is stale.
- `apps/web/types/contracts-compat.ts` checks drift at compile time. Every
  field a UI type declares must exist on the Prisma model, be one of its
  relations (including Prisma's `_count`), or be listed there as computed by
  the API. Renaming or removing a column then fails `pnpm typecheck`.
- `next.config.ts` sets the monorepo root, so Next traces and bundles files
  from `packages/*`.
