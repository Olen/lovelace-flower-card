// Flat config (eslint 9+). Preserves the previous .eslintrc.json ruleset:
// eslint:recommended + @typescript-eslint recommended, scoped to TS sources.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Build artifacts and vendored output are not linted.
  {
    ignores: ['flower-card.js', 'flower-card-small.js', 'flower-card.js.LICENSE.txt'],
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
);
