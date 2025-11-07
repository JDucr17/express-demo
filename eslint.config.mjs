import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Ignora generados y archivos de configuración
  {
    ignores: [
      "dist/",
      "drizzle/",
      "node_modules/",
      "coverage/",
      "*.sqlite",
      ".eslintrc.cjs",
      "eslint.config.mjs",
      "esbuild.config.mjs",
    ],
  },

  // Base JS
  js.configs.recommended,

  // ---- Overrides para TypeScript ----
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  prettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "import/order": ["warn", { "newlines-between": "always" }],
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-unreachable": "error",
      "no-await-in-loop": "warn",
    },
  },

  // ---- Overrides para JS/mjs/cjs: SIN projectService ----
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      //  Reglas específicas para JS
    },
  },
);
