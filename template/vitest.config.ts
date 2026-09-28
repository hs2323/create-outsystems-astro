/// <reference types="vitest" />
import angular from "@analogjs/vite-plugin-angular";
import preact from "@preact/preset-vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import { ember } from "ember-astro";
import { stencilLoader } from "islands-integrations/stencil";
import { twigLoader } from "islands-integrations/twig";
import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

// ember-astro only exposes its Vite plugins (Embroider and the template-tag
// Babel transform) through its Astro hook, so collect them from there.
async function emberVitePlugins() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let plugins: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ember() as any).hooks["astro:config:setup"]({
    addRenderer: () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateConfig: (config: any) => {
      plugins = config.vite.plugins;
    },
  });
  return plugins;
}

export default defineConfig(async ({ mode }) => ({
  test: {
    projects: [
      {
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/alpine/**/*.test.ts"],
          name: "alpine",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
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
        plugins: await emberVitePlugins(),
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/ember/**/*.test.ts"],
          name: "ember",
          // The client entrypoint imports `@ember/*` modules, which only the
          // Embroider resolver can find, so it has to go through Vite.
          server: { deps: { inline: ["ember-astro"] } },
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/jquery/**/*.test.ts"],
          name: "jquery",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/lit/**/*.test.ts"],
          name: "lit",
          setupFiles: ["test/setup-test-env.ts"],
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
        plugins: [qwikVite() as any],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/qwik/**/*.test.tsx"],
          name: "qwik",
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
        plugins: [solid() as any],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/solid/**/*.test.tsx"],
          name: "solid",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        // The loader compiles the components with Stencil, as it does in the
        // Astro build.
        plugins: [
          stencilLoader({
            include: [
              "src/framework/stencil/*",
              "test/integration/stencil/fixtures/*",
            ],
          }),
        ],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/stencil/**/*.test.ts"],
          name: "stencil",
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
        // The Twig loader inlines `{% include %}` tags and resolves `asset()`
        // paths, so tests see the same template the island renders.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plugins: [twigLoader() as any],
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/twig/**/*.test.ts"],
          name: "twig",
          setupFiles: ["test/setup-test-env.ts"],
        },
      },
      {
        test: {
          environment: "happy-dom",
          globals: true,
          include: ["test/integration/vanilla/**/*.test.ts"],
          name: "vanilla",
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
