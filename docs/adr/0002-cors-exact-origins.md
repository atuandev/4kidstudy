# 0002. CORS allows exact origins only

- Status: Accepted
- Date: 2026-11-21

## Context

The API sends `credentials: true` (cookies and auth headers), so browsers
reject a wildcard `Access-Control-Allow-Origin`. The Vercel project was
renamed from `4kidstudy-frontend` to `4kidstudy`, and the old aliases still
serve some links.

## Decision

`apps/api/src/main.ts` lists exact origins: localhost, the production
aliases and the `dev` / `dev2` branch previews, under both the old and the
new project names. More origins come from `CORS_ORIGINS`, comma-separated.

## Consequences

- A new preview branch needs `CORS_ORIGINS` or a code change.
- The `4kidstudy-frontend-*` aliases can be removed once nothing serves
  them.
