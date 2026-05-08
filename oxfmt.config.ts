import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    "**/components/ui/*.tsx",
    "**/*.lock*",
    "**/*.gen.ts",
    "**/worker-configuration.d.ts"
  ],
  singleAttributePerLine: true,
  sortImports: {
    groups: [
      "type-import",
      ["value-builtin", "value-external"],
      "type-internal",
      "value-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-parent", "value-sibling", "value-index"],
      "unknown"
    ]
  },
  sortTailwindcss: {
    functions: ["cn", "cva"],
    stylesheet: "apps/web/src/styles.css"
  },
  trailingComma: "none"
});
