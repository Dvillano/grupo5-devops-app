import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    // Allow Node globals (process, Buffer, __dirname, etc.) and keep browser globals
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaVersion: 2021 },
      sourceType: "module"
    },
    rules: {
      // allow console logging in this project
      "no-console": "off",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_?next$" }]
    },
    ignores: ["**/temp.js", "config/*"],
  },
]);
