import eslint from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"

export default [
   // إعدادات عامة للمشروع
   {
      files: ["**/*.{js,jsx,ts,tsx,vue}"], // حدد الامتدادات المطلوبة
      languageOptions: {
         parser: tsparser,
         parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: { jsx: true }
         },
         globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.es2021
         }
      },
      plugins: {
         "@typescript-eslint": tseslint,
         "react-hooks": reactHooks
      },
      rules: {
         "@typescript-eslint/no-unused-vars": [
            "warn",
            {
               vars: "all",
               varsIgnorePattern: "^_",
               args: "after-used",
               argsIgnorePattern: "^_"
            }
         ],
         "react-hooks/rules-of-hooks": "error",
         "react-hooks/exhaustive-deps": "warn"
      }
   },
   // تجاهل بعض الملفات إذا أردت
   {
      ignores: ["node_modules", "dist", "build", "*.config.js"]
   }
]
