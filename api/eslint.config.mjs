// eslint.config.mjs
import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
  // ESLint’s recommended rules.
  eslint.configs.recommended,

  // Import plugin recommended configs
  importPlugin.flatConfigs.recommended,

  // Spread in the TypeScript ESLint plugin’s recommended rules.
  ...tsEslint.configs.recommended,
  {
    // Global configuration for all files.
    languageOptions: {
      // Use the latest ECMAScript version and module source type.
      ecmaVersion: "latest",
      sourceType: "module",
      // Define common Node.js globals.
      globals: {
        __dirname: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        console: "readonly"
      },
    },
    settings: {
      // Configure the import resolver to handle both JS and TS files.
      "import/resolver": {
        // You will also need to install and configure the TypeScript resolver
        // See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
        "typescript": true,
        "node": true,
      },

    },
    ignores: ['node_modules', 'dist', 'build'],
  },
  // Override configuration for TypeScript files.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ]
    },
    files: ["src/**/*.ts"],
    languageOptions: {
      // Use the TypeScript parser for TS files.
      parser: tsEslint.parser,
      parserOptions: {
        // If you use type-aware linting, point to your tsconfig.json.
        project: "./tsconfig.json",
        // tsconfigRootDir is set to the current working directory.
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      // Make the TypeScript ESLint plugin available.
      "@typescript-eslint": tsEslint.plugin,
    },
  },
];