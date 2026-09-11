// @ts-check
import angular from "@analogjs/astro-angular";
import preact from "@astrojs/preact";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import qwikAstro from "@qwik.dev/astro";
import { defineConfig } from "astro/config";
import qwik from "islands-integrations/qwik";
import twig from "islands-integrations/twig";
import vanilla from "islands-integrations/vanilla";

// https://astro.build/config
export default defineConfig({
  build: {
    assets: "assets",
    inlineStylesheets: "always",
  },
  integrations: [
    angular({
      vite: {
        transformFilter: (_code, id) => {
          return id.includes("src/framework/angular");
        },
      },
    }),
    vanilla({
      include: ["src/framework/vanilla/*"],
    }),
    preact({
      compat: true,
      include: ["src/framework/preact/*"],
    }),
    react({
      include: ["src/framework/react/*"],
    }),
    solid({
      devtools: true,
      include: ["src/framework/solid/*"],
    }),
    svelte({
      include: ["src/framework/svelte/*"],
    }),
    twig({
      include: ["src/framework/twig/*"],
    }),
    vue({
      include: ["src/framework/vue/*"],
    }),
    qwik(
      qwikAstro({
        include: ["src/framework/qwik/*"],
      }),
    ),
  ],
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: `assets/[name].[hash].[ext]`,
          chunkFileNames: `[name].[hash].js`,
          entryFileNames: `[name].[hash].js`,
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              return "app";
            }
          },
        },
      },
    },
    // @qwik.dev/astro only defines __EXPERIMENTAL__.suspense, so Astro's
    // prerender environment throws on Qwik's other compile-time feature flags.
    // These are opt-in experimental features and stay disabled here.
    define: {
      "__EXPERIMENTAL__.each": "false",
      "__EXPERIMENTAL__.errorBoundary": "false",
      "__EXPERIMENTAL__.show": "false",
    },
    resolve: {
      alias: {
        fs: "node:fs",
        http: "node:http",
        https: "node:https",
        os: "node:os",
        path: "node:path",
        url: "node:url",
      },
    },
  },
});
