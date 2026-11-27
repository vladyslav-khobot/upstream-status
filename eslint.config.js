import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginQuery from '@tanstack/eslint-plugin-query';
import { importX } from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist', '**/node_modules', 'apps/web/src/routeTree.gen.ts'] },

  // Code style for every file in the repo.
  {
    plugins: { '@stylistic': stylistic, 'import-x': importX },
    rules: {
      '@stylistic/semi': ['error', 'always'],

      // Arrow functions instead of `function` declarations.
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',

      // `const { a } = obj` instead of `const a = obj.a`.
      'prefer-destructuring': [
        'error',
        {
          VariableDeclarator: { object: true, array: false },
          AssignmentExpression: { object: false, array: false },
        },
      ],

      // Libraries first, then local modules, separated by an empty line.
      'import-x/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': ['error', { 'prefer-inline': false }],
      // `import type { A }` on its own line, never `import { type A, b }`.
      'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    },
  },

  // Shared rules for every TypeScript file in the repo.
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Plain functions and objects instead of classes.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration, ClassExpression',
          message: 'Use functions and plain objects instead of classes.',
        },
      ],
    },
  },

  // Types live in their own files (`types.ts` / `contract.ts`), not next to the code using them.
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/types.ts', '**/contract.ts', '**/*.d.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration, ClassExpression',
          message: 'Use functions and plain objects instead of classes.',
        },
        {
          selector: 'TSInterfaceDeclaration, TSTypeAliasDeclaration',
          message: 'Move types to a types.ts file next to this one.',
        },
      ],
    },
  },

  {
    files: ['apps/api/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // node:test's describe/it return promises that the runner itself awaits.
  {
    files: ['apps/api/test/**/*.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },

  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      ...pluginQuery.configs['flat/recommended'],
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      // TanStack Router control flow is done by throwing notFound() / redirect(), which are not Errors.
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              package: '@tanstack/router-core',
              name: ['NotFoundError', 'Redirect'],
            },
          ],
        },
      ],
    },
  },

  // Route files export `Route` next to their components. The TanStack Router plugin
  // splits them into separate chunks itself, so fast refresh keeps working.
  {
    files: ['apps/web/src/routes/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Plain JS config files are not part of any tsconfig, so skip type-aware linting there.
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended, tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
);
