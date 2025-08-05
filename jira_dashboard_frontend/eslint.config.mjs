import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      "build/",
      "dist/",
      "*.log",
      "*.tmp",
      "*.tsbuildinfo",
      "coverage/",
      ".vscode/",
      ".idea/",
      "*.config.mjs",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Your custom rules here
    },
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        btoa: "readonly",
        atob: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        CustomEvent: "readonly",
        sessionStorage: "readonly",
        localStorage: "readonly",
        location: "readonly",
        navigator: "readonly",
        // Vite globals
        import: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
    },
  },
];
