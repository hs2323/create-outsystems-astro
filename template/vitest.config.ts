/// <reference types="vitest" />
import angular from "@analogjs/vite-plugin-angular";
import preact from "@preact/preset-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
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
        plugins: [preact() as any],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/preact/**/*.test.tsx"],
          name: "preact",
          setupFiles: ["test/setup-test-env.ts"],
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
        plugins: [svelte() as any],
        resolve: {
          conditions: mode === "test" ? ["browser"] : [],
        },
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/svelte/**/*.test.ts"],
          name: "svelte",
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
}));
