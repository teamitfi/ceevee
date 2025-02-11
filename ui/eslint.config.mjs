// eslint.config.mjs
import eslint from '@eslint/js';
import tsEslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tsEslint.config({
  ignores: ['node_modules/**/*', 'dist/**/*', 'build/**/*', '.react-router/**/*'],
  files: ['**/*.mjs', '**/*.ts', '**/*.tsx'],
  extends: [
    eslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    tsEslint.configs.recommended,
    reactPlugin.configs.flat.recommended,
    { rules: reactHooks.configs.recommended.rules }
  ],
  plugins: { 'react-hooks': reactHooks },
  languageOptions: {
    // Use the latest ECMAScript version and module source type.
    ecmaVersion: 'latest',
    sourceType: 'module',
    // Define common Node.js globals.
    globals: {
      __dirname: 'readonly',
      process: 'readonly',
      module: 'readonly',
      require: 'readonly',
      exports: 'readonly',
      console: 'readonly'
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    // Configure the import resolver to handle both JS and TS files.
    'import/resolver': {
      // You will also need to install and configure the TypeScript resolver
      // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
      'typescript': true,
      'node': true,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'args': 'all',
        'argsIgnorePattern': '^_',
        'caughtErrors': 'all',
        'caughtErrorsIgnorePattern': '^_',
        'destructuredArrayIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }
    ],
    'react/react-in-jsx-scope': 'off',
    'quotes': ['error', 'single', { avoidEscape: true }],
  },
});