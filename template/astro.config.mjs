// @ts-check
import angular from "@analogjs/astro-angular";
import preact from "@astrojs/preact";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import qwikAstro from "@qwik.dev/astro";
import { defineConfig } from "astro/config";
import { ember } from "ember-astro";
import alpine from "islands-integrations/alpine";
import jquery from "islands-integrations/jquery";
import lit from "islands-integrations/lit";
import qwik from "islands-integrations/qwik";
import twig from "islands-integrations/twig";
import vanilla from "islands-integrations/vanilla";

// Each framework's runtime gets its own chunk, so an island only loads the
// framework it uses. Packages that are not listed, such as astro and
// nanostores, go to the shared "app" chunk.
/** @type {Record<string, (string | RegExp)[]>} */
const frameworkChunks = {
  alpine: ["alpinejs", "@nanostores/alpine"],
  angular: [/^@angular\//, /^@analogjs\//, "rxjs", "zone.js"],
  ember: [
    "ember-astro",
    "ember-source",
    "decorator-transforms",
    /^@ember\//,
    /^@embroider\//,
    /^@glimmer\//,
  ],
  jquery: ["jquery"],
  lit: ["lit", "lit-element", "lit-html", /^@lit\//, "@nanostores/lit"],
  preact: ["preact", /^@preact\//, "@astrojs/preact", "@nanostores/preact"],
  qwik: [/^@qwik\.dev\//],
  react: [
    "react",
    "react-dom",
    "scheduler",
    "@astrojs/react",
    "@nanostores/react",
  ],
  solid: ["solid-js", "@astrojs/solid-js", "@nanostores/solid"],
  svelte: ["svelte", "@astrojs/svelte", "@nanostores/svelte-runes"],
  twig: ["twig", "locutus"],
  vue: [/^@vue\//, "vue", "@astrojs/vue", "@nanostores/vue"],
};

/**
 * @param {string} id
 * @returns {string | undefined}
 */
function getChunkName(id) {
  // Vite's preload helper is used by every framework. Left alone, the bundler
  // puts it in whichever framework chunk it sees first.
  if (id.startsWith("\0vite/")) return "app";
  const match = id.match(/.*node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (!match) return;
  const pkg = match[1];
  for (const [framework, patterns] of Object.entries(frameworkChunks)) {
    if (
      patterns.some((p) => (typeof p === "string" ? p === pkg : p.test(pkg)))
    ) {
      return `app-${framework}`;
    }
  }
  return "app";
}

// https://astro.build/config
export default defineConfig({
  build: {
    assets: "assets",
    inlineStylesheets: "always",
  },
  integrations: [
    alpine({
      include: ["src/framework/alpine/*"],
    }),
    angular({
      vite: {
        transformFilter: (_code, id) => {
          return id.includes("src/framework/angular");
        },
      },
    }),
    // ember-astro types its integration as `unknown`.
    /** @type {import("astro").AstroIntegration} */ (ember()),
    jquery({
      include: ["src/framework/jquery/*"],
    }),
    lit({
      include: ["src/framework/lit/*"],
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
          manualChunks: getChunkName,
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
      // @embroider/vite replaces an unset extensions list with Ember's own,
      // which drops .jsx and .tsx, so extensionless imports of JSX components
      // (such as Qwik's during server rendering) fail to resolve. Keep Vite's
      // defaults and add the Ember ones.
      extensions: [
        ".mjs",
        ".js",
        ".mts",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".gjs",
        ".gts",
        ".hbs",
      ],
    },
  },
});
