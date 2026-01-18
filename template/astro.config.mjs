// @ts-check
import angular from "@analogjs/astro-angular";
import react from "@astrojs/react";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  build: {
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
    react(),
    vue(),
  ],
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: `assets/[name]_[hash].[ext]`,
          chunkFileNames: `[name]_[hash].js`,
          entryFileNames: `[name]_[hash].js`,
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              return "app";
            }
          },
        },
      },
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
