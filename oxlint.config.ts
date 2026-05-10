import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import remix from "ultracite/oxlint/remix";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, remix, vitest],
  ignorePatterns: [
    "**/components/ui/*.tsx",
    "**/*.lock*",
    "**/*.gen.ts",
    "**/worker-configuration.d.ts"
  ],
  overrides: [
    {
      files: ["**/routes/**/*.{ts,tsx}"],
      rules: {
        "unicorn/filename-case": "off"
      }
    }
  ],
  rules: {
    "func-style": "off",
    "no-console": "off",
    "no-use-before-define": "off"
  }
});
