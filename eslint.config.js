import tseslint from "typescript-eslint";
import tsParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    "plugins": [
      "sort-imports-es6-autofix"
    ],
    rules: {
      '@/indent': ['error', 2],
      "sort-imports-es6-autofix/sort-imports-es6": [2, {
        "ignoreCase": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
      }]
    },
  }
];