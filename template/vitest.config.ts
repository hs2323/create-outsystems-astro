/// <reference types="vitest" />
import angular from "@analogjs/vite-plugin-angular";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plugins: [angular({ tsconfig: "tsconfig.spec.json" }) as any],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/angular/**/*.{test,spec}.ts"],
          name: "angular",
          pool: "forks",
          setupFiles: ["test/setup-test-env-angular.ts"],
        },
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plugins: [react() as any],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/react/**/*.test.tsx"],
          name: "react",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plugins: [vue() as any],
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
