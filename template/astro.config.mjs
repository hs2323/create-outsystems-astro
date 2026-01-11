// @ts-check
import angular from "@analogjs/astro-angular";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    angular({
      vite: {
        transformFilter: (_code, id) => {
          return id.includes("src/framework/angular");
        },
      },
    }),
    react(),
    vue(),
  ],
  build: {
    inlineStylesheets: "always",
  },
  vite: {
    resolve: {
      alias: {
        url: "node:url",
        path: "node:path",
        fs: "node:fs",
        os: "node:os",
        http: "node:http",
        https: "node:https",
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              return "app.js";
            }
          },
          entryFileNames: `[name]_[hash].js`,
          chunkFileNames: `[name]_[hash].js`,
          assetFileNames: `assets/[name]_[hash].[ext]`,
        },
      },
    },
  },
  server: {
    host: true,
    port: 4321,
  },
});
