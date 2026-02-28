import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // TypeScript recommended and stylistic configs
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      import: eslintPluginImport,
      'unused-imports': eslintPluginUnusedImports,
      prettier: eslintPluginPrettier,
    },
    rules: {
      // -------------------------
      // Prettier formatting
      // -------------------------
      // Prettier handles all code style: line length, indentation, spacing, blank lines
      'prettier/prettier': ['error', { printWidth: 80 }],

      // -------------------------
      // TypeScript-specific rules
      // -------------------------
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports

      // -------------------------
      // Unused imports / variables
      // -------------------------
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // -------------------------
      // Import rules
      // -------------------------
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          ts: 'never',
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['\\.js$', '\\.json$'],
        },
      ],
    },
  },

  // -------------------------
  // Prettier rules override
  // -------------------------
  {
    rules: {
      ...prettierConfig.rules,
    },
  },

  // -------------------------
  // Ignored files
  // -------------------------
  {
    ignores: ['dist/**/*', 'eslint.config.js'],
  },
];
