/**
 * @4kidstudy/contracts — the API contract between apps/api and apps/web.
 *
 * - Enums and model shapes come from apps/api/prisma/schema.prisma.
 * - Request/response DTO schemas come from the API's OpenAPI document.
 *
 * Regenerate with `pnpm contracts:generate` after changing the Prisma schema
 * or any DTO. CI fails if the committed output is stale.
 */
export * from './generated/prisma';
export type { components, operations, paths } from './generated/openapi';

import type { components } from './generated/openapi';

/** DTO schemas from the API's OpenAPI document, keyed by class name. */
export type ApiSchemas = components['schemas'];
