/// <reference types="vitest" />
import angular from "@analogjs/vite-plugin-angular";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [angular({ tsconfig: "tsconfig.spec.json" })],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/angular/**/*.{test,spec}.ts"],
          name: "angular",
          setupFiles: ["test/setup-test-env-angular.ts"],
        },
      },
      {
        plugins: [react()],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/react/**/*.test.tsx"],
          name: "react",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        plugins: [vue()],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/vue/**/*.test.ts"],
          name: "vue",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        test: {
          environment: "node",
          globals: true,
          include: ["**/*.test.ts"],
          name: "unit",
          root: "./test/unit",
        },
      },
    ],
    reporters: ["default"],
  },
});
