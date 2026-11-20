// @ts-check
// Next.js app rules. eslint-config-next 16+ ships native flat configs.
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

export function nextConfig() {
  return [
    ...coreWebVitals,
    ...typescript,
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
