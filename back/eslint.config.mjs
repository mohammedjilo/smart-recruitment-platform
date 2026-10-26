import tseslint from "typescript-eslint";
import { unusedImports } from "@smart-recruitment/eslint-config";

export default [
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
  },
  {
    ignores: ["node_modules", "dist", "build", "*.config.*"],
  },
  unusedImports,
];
