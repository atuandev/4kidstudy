// @ts-check
// Minimal type-aware config for internal TypeScript packages.
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @param {{ tsconfigRootDir: string }} options */
export function baseConfig({ tsconfigRootDir }) {
  return tseslint.config(
    { ignores: ['eslint.config.mjs', 'dist/**', 'src/generated/**'] },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
    },
    {
      // Node scripts (e.g. code generators) are plain JS, outside the TS project.
      files: ['**/*.{js,mjs,cjs}'],
      extends: [tseslint.configs.disableTypeChecked],
      languageOptions: { globals: globals.node },
    },
  );
}
