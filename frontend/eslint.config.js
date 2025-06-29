// frontend/eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsEslint from '@typescript-eslint/eslint-plugin';

export default [
  // 1) Base JS rules
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    extends: [
      js.configs.recommended,
      'plugin:react-refresh/recommended',
    ],
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 2) TS & TSX rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    extends: [
      js.configs.recommended,
      'plugin:@typescript-eslint/recommended',
    ],
    plugins: {
      '@typescript-eslint': tsEslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // TypeScript-specific
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // Fast refresh rule
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];

