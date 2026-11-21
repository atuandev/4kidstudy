export * from './generated/prisma';
export type { components, operations, paths } from './generated/openapi';

import type { components } from './generated/openapi';

export type ApiSchemas = components['schemas'];
