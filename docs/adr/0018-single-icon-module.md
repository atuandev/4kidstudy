# 0018. One icon module

- Status: Accepted
- Date: 2026-11-21

## Decision

`apps/web/components/icons.tsx` is the app's only icon set: Phosphor,
defaulting to the bold weight so strokes sit with Nunito 900. Import icons
from there, never from `@phosphor-icons/react` directly. It uses Phosphor's
SSR entry, which needs no React context, so the icons work in server and
client components alike. Pass `weight="fill"` or `weight="duotone"` for
sticker-style badges and section icons. Add a new icon to that module's
imports and exports.

## Consequences

Nothing enforces the import rule yet. `no-restricted-imports` in
`apps/web/.oxlintrc.json` could.
