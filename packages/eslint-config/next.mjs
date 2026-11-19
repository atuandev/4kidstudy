// @ts-check
// Next.js app rules (moved unchanged from apps/web/eslint.config.mjs).
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// Resolve eslint-config-next from this package, where it is a dependency.
const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

export function nextConfig() {
  return [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
      ignores: [
        'node_modules/**',
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
      ],
    },
  ];
}
