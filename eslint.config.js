//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      '.content-collections/generated/**',
      'convex/_generated/**',
      'src/paraglide/**/*.js',
      'src/paraglide/**/*.d.ts',
    ],
  },
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/routes/demo/**/*.{ts,tsx}'],
    rules: {
      'import/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@stylistic/spaced-comment': 'off',
    },
  },
]
