import unusedImportsPlugin from "eslint-plugin-unused-imports";

const unusedImportsConfig = {
  name: "@smart-recruitment/eslint-config/unused-imports",
  files: ["**/*.{js,cjs,mjs,jsx,ts,tsx}"],
  plugins: {
    "unused-imports": unusedImportsPlugin,
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
};

export default unusedImportsConfig;
