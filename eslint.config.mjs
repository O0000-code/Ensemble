// eslint.config.mjs — Ensemble 项目 ESLint 配置（Flat Config 格式）
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "dist/",
      "src-tauri/",
      "node_modules/",
      "*.config.*",
      "generate-ico.*",
    ],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React Compiler rules (react-hooks v7+) — disable for now since
      // the existing codebase was not written with the compiler in mind.
      "react-hooks/static-components": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "off",
      "no-console": ["warn", {
        allow: ["warn", "error"],
      }],
      "no-useless-escape": "warn",
    },
  },
  eslintConfigPrettier,
);
