import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      ...typescriptEslint.configs["recommended-type-checked"].rules,
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**", 
      "next.config.mjs",
      "postcss.config.mjs",
      "eslint.config.js",
      "drizzle/**"
    ],
  },
];