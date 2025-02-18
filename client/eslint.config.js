import pluginVue from "eslint-plugin-vue";
import { FlatCompat } from "@eslint/eslintrc";
import pluginVitest from "@vitest/eslint-plugin";
import oxlint from "eslint-plugin-oxlint";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

const compat = new FlatCompat();

export default [
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
  },

  ...pluginVue.configs["flat/essential"],
  ...compat.extends("@vue/eslint-config-typescript"),

  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },
  oxlint.configs["flat/recommended"],
  skipFormatting,
];
