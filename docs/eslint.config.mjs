import { fixupPluginRules } from "@eslint/compat";
import markdown from "@eslint/markdown";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import globals from "globals";
import tseslint from "typescript-eslint";

// Fix for Bun and eslint-plugin-perfectionist.
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function (compareFn) {
    return [...this].sort(compareFn);
  };
}

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      ".astro/*",
      "node_modules/*",
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } }, },
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  })),
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    rules: {
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          groups: ["builtin", "external", "internal", "parent", "sibling"],
          pathGroups: [
            {
              group: "internal",
              pattern: "~/**",
              position: "after",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.md", "**/*.markdown"],
    plugins: {
      markdown,
    },
    processor: markdown.processors.markdown,
    rules: {
      ...markdown.configs.recommended.rules,
      "markdown/no-html": "error",
    },
  },
  eslintConfigPrettier,
  perfectionist.configs["recommended-alphabetical"],
  {
    rules: {
      "perfectionist/sort-imports": ["off"],
    },
  },
];
